import { Router } from "express";
import { runDailySync } from "../controllers/cronController.js";

const cronRoutes = Router();

cronRoutes.post("/cron-sync", runDailySync);

export default cronRoutes;
