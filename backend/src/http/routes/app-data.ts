import { Router, Response } from "express";
import { getExternalModels } from "../../modules/apps/external-db.js";
import { requireAuth, requireAdmin, AuthedRequest } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { notFound } from "../../shared/errors/index.js";

/**
 * Generic, app-agnostic reads into any registered ecosystem app's database.
 * `:slug` names which app — "quantalog" today, whatever else registers next.
 * Nothing here is hardcoded to one app.
 */
const router = Router({ mergeParams: true });
router.use(requireAuth, requireAdmin);

const PAGE_SIZE = 15;

function escapeRegex(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

router.get(
  "/:slug/users",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const { User, Workspace, Subscription } = await getExternalModels(String(req.params.slug));

    const q = String(req.query.q ?? "").trim();
    const page = Math.max(1, Number(req.query.page) || 1);

    const filter: Record<string, unknown> = {};
    if (q) {
      filter.$or = [
        { email: { $regex: escapeRegex(q), $options: "i" } },
        { name: { $regex: escapeRegex(q), $options: "i" } },
      ];
    }

    const [users, total] = await Promise.all([
      User.find(filter)
        .select("email name role avatarUrl createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE),
      User.countDocuments(filter),
    ]);

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

    res.json({
      users: users.map((u: any) => ({
        id: u.id,
        email: u.email,
        name: u.name,
        role: u.role,
        avatarUrl: u.avatarUrl ?? "",
        createdAt: u.get("createdAt"),
        workspaceCount: wsCountByUser.get(u.id) ?? 0,
        plan: bestByUser.get(u.id) ?? null,
      })),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  })
);

router.get(
  "/:slug/workspaces",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const { Workspace, User, Subscription } = await getExternalModels(String(req.params.slug));

    const q = String(req.query.q ?? "").trim();
    const page = Math.max(1, Number(req.query.page) || 1);

    const filter: Record<string, unknown> = {};
    if (q) filter.name = { $regex: escapeRegex(q), $options: "i" };

    const [workspaces, total] = await Promise.all([
      Workspace.find(filter)
        .select("name slug userId createdAt")
        .sort({ createdAt: -1 })
        .skip((page - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE),
      Workspace.countDocuments(filter),
    ]);

    const ownerIds = workspaces.map((w: any) => w.userId);
    const wsIds = workspaces.map((w: any) => w._id);
    const [owners, subs] = await Promise.all([
      User.find({ _id: { $in: ownerIds } }).select("email name"),
      Subscription.find({ workspaceId: { $in: wsIds } }).select("workspaceId planSlug currentPeriodEnd"),
    ]);

    const ownerById = new Map(owners.map((o: any) => [o.id, o]));
    const subByWorkspace = new Map(subs.map((s: any) => [String(s.workspaceId), s]));

    res.json({
      workspaces: workspaces.map((w: any) => {
        const owner: any = ownerById.get(String(w.userId));
        const sub: any = subByWorkspace.get(w.id);
        const expired = sub?.currentPeriodEnd ? new Date(sub.currentPeriodEnd).getTime() < Date.now() : true;
        return {
          id: w.id,
          name: w.name,
          slug: w.slug,
          createdAt: w.get("createdAt"),
          owner: owner ? { id: owner.id, email: owner.email, name: owner.name } : null,
          plan: sub ? { slug: sub.planSlug, expired } : null,
        };
      }),
      total,
      page,
      pages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
    });
  })
);

router.get(
  "/:slug/workspaces/:id",
  asyncHandler(async (req: AuthedRequest, res: Response) => {
    const { Workspace, User, Subscription, Site } = await getExternalModels(String(req.params.slug));

    const workspace = await Workspace.findById(req.params.id);
    if (!workspace) throw notFound("workspace not found");

    const [owner, subscription, sites] = await Promise.all([
      User.findById(workspace.userId).select("email name role createdAt"),
      Subscription.findOne({ workspaceId: workspace._id }),
      Site.find({ workspaceId: workspace._id }).select("siteId domain createdAt"),
    ]);

    res.json({
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug,
        createdAt: workspace.get("createdAt"),
      },
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
