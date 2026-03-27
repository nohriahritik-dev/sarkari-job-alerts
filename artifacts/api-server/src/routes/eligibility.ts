import { Router, type IRouter } from "express";
import { eq, and, gte, lte, or, isNull, sql } from "drizzle-orm";
import { db, jobsTable } from "@workspace/db";
import { GetJobsResponse } from "@workspace/api-zod";
import { serializeJob } from "../lib/serialize.js";

const router: IRouter = Router();

const AGE_RELAXATION: Record<string, number> = {
  General: 0,
  EWS: 0,
  OBC: 3,
  SC: 5,
  ST: 5,
};

function qualificationConditions(level: string) {
  const base = [isNull(jobsTable.qualification)];

  const kw = (...terms: string[]) =>
    terms.map((t) => sql`${jobsTable.qualification} ILIKE ${"%" + t + "%"}`);

  if (level === "10th") {
    return or(
      ...base,
      ...kw("10th", "matric", "sslc", "secondary", "eighth", "class 8", "class 9", "class 10"),
    );
  }
  if (level === "12th") {
    return or(
      ...base,
      ...kw(
        "10th", "matric", "sslc", "secondary",
        "12th", "intermediate", "higher secondary", "hsc", "+2", "plus two",
      ),
    );
  }
  if (level === "Graduate") {
    return or(
      ...base,
      ...kw(
        "10th", "matric", "12th", "intermediate", "higher secondary", "+2",
        "graduate", "graduation", "degree", "bachelor", "b.tech", "b.e",
        "b.sc", "b.com", "b.a", "b.ed", "b.pharm", "bca", "bba", "llb",
        "mbbs", "diploma", "iti", "any degree",
      ),
    );
  }
  // Post-Graduate — show everything
  return or(...base, sql`${jobsTable.qualification} IS NOT NULL`);
}

router.get("/eligibility", async (req, res): Promise<void> => {
  const {
    age,
    qualification = "",
    category = "General",
    page = "1",
    limit = "12",
  } = req.query as Record<string, string>;

  const userAge = parseInt(age, 10);
  if (!age || isNaN(userAge) || userAge < 1 || userAge > 100) {
    res.status(400).json({ error: "Provide a valid age between 1 and 100." });
    return;
  }

  const relaxation = AGE_RELAXATION[category] ?? 0;
  const effectiveMax = userAge + relaxation; // not used directly; we query where ageMax+relaxation >= userAge
  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
  const offset = (pageNum - 1) * limitNum;
  const today = new Date().toISOString().split("T")[0];

  const ageCondition = and(
    or(isNull(jobsTable.ageMin), lte(jobsTable.ageMin, userAge) as ReturnType<typeof eq>),
    or(
      isNull(jobsTable.ageMax),
      sql`(${jobsTable.ageMax} + ${relaxation}) >= ${userAge}`,
    ),
  );

  const qualCondition = qualification ? qualificationConditions(qualification) : undefined;

  const baseConditions = [
    eq(jobsTable.isVerified, true),
    gte(jobsTable.lastDate, today) as ReturnType<typeof eq>,
    ageCondition,
  ] as ReturnType<typeof eq>[];

  if (qualCondition) baseConditions.push(qualCondition as ReturnType<typeof eq>);

  const [jobs, [countRow]] = await Promise.all([
    db
      .select()
      .from(jobsTable)
      .where(and(...baseConditions))
      .orderBy(jobsTable.lastDate)
      .limit(limitNum)
      .offset(offset),
    db
      .select({ count: sql<number>`count(*)::int` })
      .from(jobsTable)
      .where(and(...baseConditions)),
  ]);

  const total = countRow?.count ?? 0;
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

export default router;
