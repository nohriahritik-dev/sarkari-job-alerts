import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import jobsRouter from "./jobs.js";
import categoriesRouter from "./categories.js";
import statesRouter from "./states.js";
import adminRouter from "./admin.js";
import eligibilityRouter from "./eligibility.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(jobsRouter);
router.use(categoriesRouter);
router.use(statesRouter);
router.use(adminRouter);
router.use(eligibilityRouter);

export default router;
