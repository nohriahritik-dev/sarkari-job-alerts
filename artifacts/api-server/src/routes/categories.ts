import { Router, type IRouter } from "express";
import { eq, gte, and, sql } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import { GetCategoriesResponse } from "@workspace/api-zod";
import { CATEGORIES } from "../lib/constants.js";

const router: IRouter = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];

  const counts = await db
    .select({
      category: jobsTable.category,
      count: sql<number>`count(*)::int`,
    })
    .from(jobsTable)
    .where(
      and(
        eq(jobsTable.isVerified, true),
        gte(jobsTable.lastDate, today) as ReturnType<typeof eq>,
      ),
    )
    .groupBy(jobsTable.category);

  const countMap = Object.fromEntries(counts.map((c) => [c.category, c.count]));

  const categories = CATEGORIES.map((cat) => ({
    slug: cat.slug,
    name: cat.name,
    color: cat.color,
    count: countMap[cat.slug] ?? 0,
  }));

  res.json(GetCategoriesResponse.parse(categories));
});

export default router;
