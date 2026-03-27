import { Router, type IRouter } from "express";
import { GetStatesResponse } from "@workspace/api-zod";
import { INDIAN_STATES } from "../lib/constants.js";

const router: IRouter = Router();

router.get("/states", async (_req, res): Promise<void> => {
  res.json(GetStatesResponse.parse(INDIAN_STATES));
});

export default router;
