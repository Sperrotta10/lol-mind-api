import { Router } from "express";
import { getChampions } from "../controllers/championController.js";

const championRoutes = Router();

championRoutes.get("/", getChampions);

export default championRoutes;
