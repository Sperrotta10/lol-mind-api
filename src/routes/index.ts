import riotRouter from "./riotRoutes.js";
import championRoutes from "./championRoutes.js";
import buildRoutes from "./buildRoutes.js";
import itemRoutes from "./itemRoutes.js";
import runeRoutes from "./runeRoutes.js";
import versionRoutes from "./versionRoutes.js";
import { Router } from "express";

export const router = Router();

router.use("/riot", riotRouter);
router.use("/champions", championRoutes);
router.use("/items", itemRoutes);
router.use("/runes", runeRoutes);
router.use("/versions", versionRoutes);
router.use("/builds", buildRoutes);
