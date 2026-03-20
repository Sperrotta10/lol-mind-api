import riotRouter from "./riotRoutes.js";
import championRoutes from "./championRoutes.js";
import buildRoutes from "./buildRoutes.js";
import { Router } from "express";

export const router = Router();

router.use("/riot", riotRouter);
router.use("/champions", championRoutes);
router.use("/builds", buildRoutes);
