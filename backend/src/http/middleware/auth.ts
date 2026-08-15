import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import { AdminUser } from "../../modules/identity/models/AdminUser.js";
import { asyncHandler } from "./async-handler.js";
import { forbidden } from "../../shared/errors/index.js";

/**
 * Shared across every ecosystem app (Quantalog included) so a token minted
 * here verifies there too. Same secret, same payload shape — `{ userId }` —
 * as real-ana-be's `signToken`.
 */
const SECRET = process.env.JWT_SECRET ?? "dev-secret";

export interface AuthedRequest extends Request {
  userId?: string;
}

type Payload = { userId: string };

export function signToken(userId: string): string {
  return jwt.sign({ userId }, SECRET, { expiresIn: "7d" });
}

export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "no token" });
  try {
    const payload = jwt.verify(token, SECRET) as Payload;
    req.userId = payload.userId;
    next();
  } catch {
    res.status(401).json({ error: "invalid token" });
  }
}

/**
 * Role read from the database rather than the token: a 7-day token would
 * otherwise keep a revoked admin's powers until it expired.
 */
export const requireAdmin = asyncHandler<AuthedRequest>(async (req, _res, next) => {
  const user = await AdminUser.findById(req.userId).select("role active");
  if (!user?.active) throw forbidden("account disabled");
  if (user.role !== "admin" && user.role !== "super_admin") throw forbidden("admin only");
  next();
});

export const requireSuperAdmin = asyncHandler<AuthedRequest>(async (req, _res, next) => {
  const user = await AdminUser.findById(req.userId).select("role active");
  if (!user?.active) throw forbidden("account disabled");
  if (user.role !== "super_admin") throw forbidden("superadmin only");
  next();
});
