import riotRouter from "./riotRoutes.js";
import matchupRoutes from "./matchupRoutes.js";
import championRoutes from "./championRoutes.js";
import buildRoutes from "./buildRoutes.js";
import { Router } from "express";

export const router = Router();

router.use("/riot", riotRouter);
router.use("/champions", championRoutes);
router.use("/matchup", matchupRoutes);
router.use("/builds", buildRoutes);
