import mongoose, { Schema } from "mongoose";
import { App } from "./models/App.js";
import { notFound } from "../../shared/errors/index.js";

/**
 * Read-only schemas shared by every ecosystem app that registers here.
 *
 * Not Quantalog-specific: this is the shape any app in the ecosystem is
 * expected to follow (a `User`, a `Workspace` owned by one, a `Subscription`
 * per workspace, `Site`s under a workspace) so one generic module can read
 * any of them by slug. Fields are trimmed to what this console displays.
 */
const userSchema = new Schema(
  {
    email: String,
    name: String,
    role: String,
    avatarUrl: String,
  },
  { timestamps: true, collection: "users" }
);

const workspaceSchema = new Schema(
  {
    userId: Schema.Types.ObjectId,
    name: String,
    slug: String,
  },
  { timestamps: true, collection: "workspaces" }
);

const subscriptionSchema = new Schema(
  {
    workspaceId: Schema.Types.ObjectId,
    userId: Schema.Types.ObjectId,
    planSlug: String,
    orbitPlanSlug: String,
    cycle: String,
    status: String,
    currentPeriodStart: Date,
    currentPeriodEnd: Date,
    auditsUsed: Number,
    crawlsUsed: Number,
    eventsUsed: Number,
  },
  { timestamps: true, collection: "subscriptions" }
);

const siteSchema = new Schema(
  {
    siteId: String,
    workspaceId: Schema.Types.ObjectId,
    domain: String,
  },
  { timestamps: true, collection: "sites" }
);

type ExternalModels = {
  User: mongoose.Model<any>;
  Workspace: mongoose.Model<any>;
  Subscription: mongoose.Model<any>;
  Site: mongoose.Model<any>;
};

// One cached connection (+ its models) per registered app slug. A registry
// entry rarely changes, so a connection opened once is reused for the life
// of the process rather than reopened per request.
const connections = new Map<string, { conn: mongoose.Connection; models: ExternalModels }>();

async function openConnection(slug: string, mongoUri: string, dbName: string) {
  const conn = mongoose.createConnection(mongoUri, { dbName });
  await conn.asPromise();
  const models: ExternalModels = {
    User: conn.model("User", userSchema),
    Workspace: conn.model("Workspace", workspaceSchema),
    Subscription: conn.model("Subscription", subscriptionSchema),
    Site: conn.model("Site", siteSchema),
  };
  connections.set(slug, { conn, models });
  return models;
}

/** Look up a registered app by slug and return its (cached) read-only models. */
export async function getExternalModels(slug: string): Promise<ExternalModels> {
  const cached = connections.get(slug);
  if (cached) return cached.models;

  const app = await App.findOne({ slug: slug.toLowerCase(), active: true });
  if (!app) throw notFound(`no registered app "${slug}"`);

  return openConnection(app.slug, app.mongoUri, app.dbName);
}

/** Drop a cached connection — call after an app's URI/dbName changes or it's removed. */
export async function evictExternalConnection(slug: string): Promise<void> {
  const cached = connections.get(slug);
  if (!cached) return;
  connections.delete(slug);
  await cached.conn.close();
}
