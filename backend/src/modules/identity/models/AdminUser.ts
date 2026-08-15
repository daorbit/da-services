import mongoose, { Schema, InferSchemaType } from "mongoose";

/**
 * `super_admin` is not grantable through the role-change route — only a
 * direct DB write can set it, so a request body can never spoof it.
 */
export const ROLES = ["super_admin", "admin"] as const;
export type Role = (typeof ROLES)[number];

/**
 * Which ecosystem apps this admin can act on (e.g. "quantalog"). Empty means
 * no app access yet — granted deliberately, same as the role itself.
 */
const adminUserSchema = new Schema(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, enum: ROLES, required: true, default: "admin" },
    apps: { type: [String], default: [] },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type AdminUserDoc = InferSchemaType<typeof adminUserSchema>;
export const AdminUser = mongoose.model("AdminUser", adminUserSchema);
