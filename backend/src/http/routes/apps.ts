import { Router, Response } from "express";
import { App } from "../../modules/apps/models/App.js";
import { evictExternalConnection } from "../../modules/apps/external-db.js";
import { requireAuth, requireSuperAdmin, requireAdmin, AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { badRequest, notFound } from "../../shared/errors/index.js";

const router = Router();

/** Anyone signed in can see which apps exist, for nav — never the connection string. */
function publicApp(app: InstanceType<typeof App>) {
  return {
    id: app.id,
    slug: app.slug,
    name: app.name,
    dbName: app.dbName,
    active: app.active,
    createdAt: app.createdAt,
  };
}

router.get(
  "/",
  requireAuth,
  requireAdmin,
  asyncHandler(async (_req: AuthedRequest, res: Response) => {
    const apps = await App.find({ active: true }).sort({ name: 1 });
    res.json({ apps: apps.map(publicApp) });
  })
);

// Registering an app means handing over its database credential, so
// everything below is superadmin-only.
router.use(requireAuth, requireSuperAdmin);

router.post(
  "/",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const { slug, name, mongoUri, dbName } = req.body ?? {};
    if (!slug || !name || !mongoUri || !dbName) {
      throw badRequest("slug, name, mongoUri and dbName are required");
    }

    const app = await App.create({
      slug: String(slug).toLowerCase().trim(),
      name,
      mongoUri,
      dbName,
    });
    res.status(201).json({ app: publicApp(app) });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const { name, mongoUri, dbName, active } = req.body ?? {};
    const app = await App.findById(req.params.id);
    if (!app) throw notFound("app not found");

    const connectionChanged = mongoUri !== undefined || dbName !== undefined;

    if (name !== undefined) app.name = name;
    if (mongoUri !== undefined) app.mongoUri = mongoUri;
    if (dbName !== undefined) app.dbName = dbName;
    if (active !== undefined) app.active = Boolean(active);
    await app.save();

    // Stale connection would otherwise keep serving the old database.
    if (connectionChanged) await evictExternalConnection(app.slug);

    res.json({ app: publicApp(app) });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const app = await App.findByIdAndDelete(req.params.id);
    if (!app) throw notFound("app not found");
    await evictExternalConnection(app.slug);
    res.status(204).end();
  })
);

export default router;
