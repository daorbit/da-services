import { Router, Response } from "express";
import { App } from "../../modules/apps/models/App.js";
import { getExternalModels } from "../../modules/apps/external-db.js";
import { requireAuth, requireAdmin, AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { notFound, badRequest } from "../../shared/errors/index.js";

/** One workspace list across every registered app, same shape as customers.ts. */
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
      const { Workspace, User, Subscription } = await getExternalModels(app.slug);

      const filter: Record<string, unknown> = {};
      if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };

      const workspaces = await Workspace.find(filter).select("name slug userId createdAt").sort({ createdAt: -1 });
      const ownerIds = workspaces.map((w: any) => w.userId);
      const wsIds = workspaces.map((w: any) => w._id);

      const [owners, subs] = await Promise.all([
        User.find({ _id: { $in: ownerIds } }).select("email name"),
        Subscription.find({ workspaceId: { $in: wsIds } }).select("workspaceId planSlug currentPeriodEnd"),
      ]);

      const ownerById = new Map(owners.map((o: any) => [o.id, o]));
      const subByWorkspace = new Map(subs.map((s: any) => [String(s.workspaceId), s]));

      for (const w of workspaces) {
        const owner: any = ownerById.get(String(w.userId));
        const sub: any = subByWorkspace.get(w.id);
        const expired = sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).getTime() < Date.now() : true;
        rows.push({
          id: w.id,
          app: app.slug,
          appName: app.name,
          name: w.name,
          slug: w.slug,
          createdAt: w.get("createdAt"),
          owner: owner ? { id: owner.id, email: owner.email, name: owner.name } : null,
          plan: sub ? { slug: sub.planSlug, expired } : null,
        });
      }
    }

    rows.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const total = rows.length;
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    res.json({ workspaces: paged, total, page, pages });
  })
);

/** One workspace's detail — needs the app slug to know which DB to read. */
router.get(
  "/:app/:id",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const app = await App.findOne({ slug: req.params.app, active: true });
    if (!app) throw badRequest(`no registered app "${req.params.app}"`);

    const { Workspace, User, Subscription, Site } = await getExternalModels(app.slug);

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) throw notFound("workspace not found");

    const [owner, subscription, sites] = await Promise.all([
      User.findById(workspace.userId).select("email name role createdAt"),
      Subscription.findOne({ workspaceId: workspace._id }),
      Site.find({ workspaceId: workspace._id }).select("siteId domain createdAt"),
    ]);

    res.json({
      app: { slug: app.slug, name: app.name },
      workspace: { id: workspace.id, name: workspace.name, slug: workspace.slug, createdAt: workspace.get("createdAt") },
      owner: owner
        ? { id: owner.id, email: owner.email, name: owner.name, role: owner.role, createdAt: owner.get("createdAt") }
        : null,
      subscription: subscription
        ? {
            planSlug: subscription.planSlug,
            orbitPlanSlug: subscription.orbitPlanSlug,
            cycle: subscription.cycle,
            status: subscription.status,
            currentPeriodStart: subscription.currentPeriodStart,
            currentPeriodEnd: subscription.currentPeriodEnd,
            auditsUsed: subscription.auditsUsed,
            crawlsUsed: subscription.crawlsUsed,
            eventsUsed: subscription.eventsUsed,
          }
        : null,
      sites: sites.map((s: any) => ({ id: s.id, siteId: s.siteId, domain: s.domain, createdAt: s.get("createdAt") })),
    });
  })
);

export default router;
