import { Router, Response } from "express";
import bcrypt from "bcryptjs";
import { AdminUser, ROLES } from "../../modules/identity/models/AdminUser.js";
import { requireAuth, requireSuperAdmin, AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { badRequest, notFound, forbidden } from "../../shared/errors/index.js";

const router = Router();

router.use(requireAuth, requireSuperAdmin);

function publicUser(user: InstanceType<typeof AdminUser>) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    apps: user.apps,
    active: user.active,
    createdAt: user.createdAt,
  };
}

router.get(
  "/",
  asyncHandler(async (_req: AuthedRequest, res: Response) => {
    const users = await AdminUser.find().sort({ createdAt: -1 });
    res.json({ users: users.map(publicUser) });
  })
);

router.post(
  "/",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const { email, password, name, role, apps } = req.body ?? {};
    if (!email || !password || !name) throw badRequest("email, password and name are required");
    if (role && !ROLES.includes(role)) throw badRequest("invalid role");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await AdminUser.create({
      email: String(email).toLowerCase().trim(),
      passwordHash,
      name,
      role: role ?? "admin",
      apps: Array.isArray(apps) ? apps : [],
    });
    res.status(201).json({ user: publicUser(user) });
  })
);

router.patch(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const { name, role, apps, active } = req.body ?? {};
    if (role && !ROLES.includes(role)) throw badRequest("invalid role");
    // Prevent a superadmin from locking themselves out.
    if (req.params.id === req.userId && (active === false || role === "admin")) {
      throw forbidden("cannot demote or disable your own account");
    }

    const user = await AdminUser.findById(req.params.id);
    if (!user) throw notFound("admin user not found");

    if (name !== undefined) user.name = name;
    if (role !== undefined) user.role = role;
    if (Array.isArray(apps)) user.apps = apps;
    if (active !== undefined) user.active = Boolean(active);

    await user.save();
    res.json({ user: publicUser(user) });
  })
);

router.delete(
  "/:id",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    if (req.params.id === req.userId) throw forbidden("cannot delete your own account");
    const user = await AdminUser.findByIdAndDelete(req.params.id);
    if (!user) throw notFound("admin user not found");
    res.status(204).end();
  })
);

export default router;
