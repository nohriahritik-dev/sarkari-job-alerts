import { Router, type IRouter } from "express";
import { fetchAndStoreJobs, reclassifyAllJobs, enrichPendingJobs } from "../lib/job-scraper.js";

const router: IRouter = Router();

router.post("/admin/refresh-jobs", async (req, res): Promise<void> => {
  req.log.info("Manual job refresh triggered");
  fetchAndStoreJobs()
    .then((result) => req.log.info(result, "Manual job refresh complete"))
    .catch((err) => req.log.error({ err }, "Manual job refresh failed"));
  res.json({ message: "Job refresh started in background" });
});

router.post("/admin/reclassify-jobs", async (req, res): Promise<void> => {
  req.log.info("Manual job reclassification triggered");
  reclassifyAllJobs()
    .then((result) => req.log.info(result, "Reclassification complete"))
    .catch((err) => req.log.error({ err }, "Reclassification failed"));
  res.json({ message: "Reclassification started in background" });
});

// Enrich all jobs missing apply_url by fetching their detail pages
router.post("/admin/enrich-all", async (req, res): Promise<void> => {
  const limitParam = req.query.limit;
  const limit = limitParam ? parseInt(limitParam as string, 10) : 9999;
  req.log.info({ limit }, "Full enrichment triggered");
  enrichPendingJobs(limit)
    .then((result) => req.log.info(result, "Full enrichment complete"))
    .catch((err) => req.log.error({ err }, "Full enrichment failed"));
  res.json({ message: `Enrichment started for up to ${limit} jobs` });
});

export default router;
