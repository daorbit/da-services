import mongoose, { Schema, InferSchemaType } from "mongoose";

/**
 * A registered ecosystem app (Quantalog, and whatever joins it later).
 *
 * `mongoUri` + `dbName` are the app's own database — this console connects
 * to it directly, read-only, to show its users and workspaces. Nothing here
 * is a credential a browser ever sees except through the superadmin-only
 * `/api/apps` routes.
 */
const appSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    mongoUri: { type: String, required: true },
    dbName: { type: String, required: true, trim: true },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type AppDoc = InferSchemaType<typeof appSchema>;
export const App = mongoose.model("App", appSchema);
