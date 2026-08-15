import { Router, Response } from "express";
import { App } from "../../modules/apps/models/App.js";
import { getExternalModels } from "../../modules/apps/external-db.js";
import { requireAuth, requireAdmin, AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async-handler.js";

/**
 * One customer list across every registered app, not one page per app — an
 * admin scanning for a person does not care which app's database they live
 * in. Each row is tagged with its app so the table can still filter/sort by
 * it, but there is exactly one table.
 */
const router = Router();
router.use(requireAuth, requireAdmin);

const PAGE_SIZE = 15;

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get(
  "/",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const q = String(req.query.q ?? "").trim();
    const appFilter = String(req.query.app ?? "").trim().toLowerCase();
    const page = Math.max(1, Number(req.query.page) || 1);

    const apps = await App.find(appFilter ? { slug: appFilter, active: true } : { active: true });

    const rows: any[] = [];
    for (const app of apps) {
      const { User, Workspace, Subscription } = await getExternalModels(app.slug);

      const filter: Record<string, unknown> = {};
      if (q) {
        filter.$or = [
          { email: { $regex: escapeRegex(q), $options: "i" } },
          { name: { $regex: escapeRegex(q), $options: "i" } },
        ];
      }

      const users = await User.find(filter).select("email name role avatarUrl createdAt").sort({ createdAt: -1 });
      const ids = users.map((u: any) => u._id);

      const [workspaces, subs] = await Promise.all([
        Workspace.find({ userId: { $in: ids } }).select("userId"),
        Subscription.find({ userId: { $in: ids } }).select("userId planSlug currentPeriodEnd"),
      ]);

      const wsCountByUser = new Map<string, number>();
      for (const w of workspaces) {
        const key = String(w.userId);
        wsCountByUser.set(key, (wsCountByUser.get(key) ?? 0) + 1);
      }

      const bestByUser = new Map<string, { planSlug: string; expired: boolean }>();
      for (const s of subs) {
        const key = String(s.userId);
        const expired = s.currentPeriodEnd ? new Date(s.currentPeriodEnd).getTime() < Date.now() : true;
        const current = bestByUser.get(key);
        if (!current || (!expired && current.expired)) {
          bestByUser.set(key, { planSlug: s.planSlug, expired });
        }
      }

      for (const u of users) {
        rows.push({
          id: u.id,
          app: app.slug,
          appName: app.name,
          email: u.email,
          name: u.name,
          role: u.role,
          avatarUrl: u.avatarUrl ?? "",
          createdAt: u.get("createdAt"),
          workspaceCount: wsCountByUser.get(u.id) ?? 0,
          plan: bestByUser.get(u.id) ?? null,
        });
      }
    }

    rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    res.json({ customers: paged, total, page, pages });
  })
);

export default router;
