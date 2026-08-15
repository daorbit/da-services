import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { AdminUser } from "../../modules/identity/models/AdminUser.js";
import { signToken, requireAuth, AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { badRequest, unauthorized } from "../../shared/errors/index.js";

const router = Router();

function publicUser(user: InstanceType<typeof AdminUser>) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    apps: user.apps,
  };
}

router.post(
  "/login",
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body ?? {};
    if (!email || !password) throw badRequest("email and password are required");

    const user = await AdminUser.findOne({ email: String(email).toLowerCase().trim() });
    if (!user || !user.active) throw unauthorized("invalid credentials");

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw unauthorized("invalid credentials");

    const token = signToken(user.id);
    res.json({ token, user: publicUser(user) });
  })
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const user = await AdminUser.findById(req.userId);
    if (!user) throw unauthorized("invalid credentials");
    res.json({ user: publicUser(user) });
  })
);

export default router;
