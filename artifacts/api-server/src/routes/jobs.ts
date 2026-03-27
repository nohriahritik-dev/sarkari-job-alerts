import { Router, type IRouter } from "express";
import { eq, and, gte, ilike, or, sql, desc } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import {
  GetJobsResponse,
  GetJobByIdResponse,
  GetJobByIdParams,
  GetClosingSoonJobsResponse,
  GetJobCountResponse,
} from "@workspace/api-zod";
import { serializeJob } from "../lib/serialize.js";

const router: IRouter = Router();

router.get("/jobs", async (req, res): Promise<void> => {
  const { search, category, state, qualification, page = "1", limit = "20" } = req.query as Record<string, string>;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const today = new Date().toISOString().split("T")[0];

  const conditions: ReturnType<typeof eq>[] = [
    eq(jobsTable.isVerified, true),
    gte(jobsTable.lastDate, today) as ReturnType<typeof eq>,
  ];

  if (search) {
    conditions.push(
      or(
        ilike(jobsTable.title, `%${search}%`),
        ilike(jobsTable.department, `%${search}%`),
        ilike(jobsTable.category, `%${search}%`),
        ilike(jobsTable.salaryRange, `%${search}%`),
        ilike(jobsTable.qualification, `%${search}%`),
      ) as ReturnType<typeof eq>,
    );
  }

  if (category) {
    conditions.push(eq(jobsTable.category, category));
  }

  if (state) {
    conditions.push(
      sql`${jobsTable.states}::jsonb @> ${JSON.stringify([state])}::jsonb` as unknown as ReturnType<typeof eq>,
    );
  }

  if (qualification) {
    conditions.push(ilike(jobsTable.qualification, `%${qualification}%`) as ReturnType<typeof eq>);
  }

  const whereClause = and(...conditions);

  const [jobs, countResult] = await Promise.all([
    db
      .select()
      .from(jobsTable)
      .where(whereClause)
      .orderBy(desc(jobsTable.createdAt))
      .limit(limitNum)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobsTable)
      .where(whereClause),
  ]);

  const total = countResult[0]?.count ?? 0;
  const totalPages = Math.ceil(total / limitNum);

  res.json(
    GetJobsResponse.parse({
      jobs: jobs.map(serializeJob),
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    }),
  );
});

router.get("/jobs/closing-soon", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];
  const threeDaysLater = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];

  const jobs = await db
    .select()
    .from(jobsTable)
    .where(
      and(
        eq(jobsTable.isVerified, true),
        gte(jobsTable.lastDate, today) as ReturnType<typeof eq>,
        sql`${jobsTable.lastDate} <= ${threeDaysLater}` as unknown as ReturnType<typeof eq>,
      ),
    )
    .orderBy(jobsTable.lastDate)
    .limit(10);

  res.json(GetClosingSoonJobsResponse.parse(jobs.map(serializeJob)));
});

router.get("/jobs/count", async (_req, res): Promise<void> => {
  const today = new Date().toISOString().split("T")[0];

  const activeWhere = and(
    eq(jobsTable.isVerified, true),
    gte(jobsTable.lastDate, today) as ReturnType<typeof eq>,
  );

  const [[countResult], [vacancyResult], [lastUpdatedResult]] = await Promise.all([
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobsTable)
      .where(activeWhere),
    db
      .select({ total: sql<number>`coalesce(sum(vacancies), 0)::int` })
      .from(jobsTable)
      .where(activeWhere),
    db
      .select({ latest: sql<string>`max(updated_at)::text` })
      .from(jobsTable),
  ]);

  res.json(
    GetJobCountResponse.parse({
      count: countResult?.count ?? 0,
      totalVacancies: vacancyResult?.total ?? 0,
      lastUpdated: lastUpdatedResult?.latest ?? undefined,
    }),
  );
});

router.get("/jobs/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = GetJobByIdParams.safeParse({ id: rawId });

  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [job] = await db.select().from(jobsTable).where(eq(jobsTable.id, params.data.id));

  if (!job) {
    res.status(404).json({ error: "Job not found" });
    return;
  }

  res.json(GetJobByIdResponse.parse(serializeJob(job)));
});

export default router;
