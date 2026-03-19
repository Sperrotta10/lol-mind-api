import riotRouter from "./riotRoutes.js";
import matchupRoutes from "./matchupRoutes.js";
import { Router } from "express";

export const router = Router();

router.use("/riot", riotRouter);
router.use("/matchup", matchupRoutes);
