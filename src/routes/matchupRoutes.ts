import { Router } from "express";
import { analyzeMatchup } from "../controllers/matchupController.js";

const matchupRoutes = Router();

matchupRoutes.post("/", analyzeMatchup);

export default matchupRoutes;
