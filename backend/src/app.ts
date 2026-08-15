import express, { Request, Response } from "express";
import cors from "cors";
import authRoutes from "./http/routes/auth.js";
import adminUsersRoutes from "./http/routes/admin-users.js";
import { errorHandler, notFoundHandler } from "./http/middleware/index.js";

const app = express();
app.set("trust proxy", true);
app.use(express.json());

const dashboardOrigins = (process.env.CORS_ORIGINS ?? "http://localhost:5174")
  .split(",")
  .map((o) => o.trim());

const dashboardCors = cors({
  origin: (origin, cb) => {
    if (!origin || dashboardOrigins.includes(origin)) return cb(null, true);
    cb(new Error(`Origin not allowed: ${origin}`));
  },
});

app.get("/api/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", dashboardCors, authRoutes);
app.use("/api/admin-users", dashboardCors, adminUsersRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
