import { Router } from "express";
import { analyzeMatch } from "../controllers/teamController.js";

const teamRoutes = Router();

/**
 * @openapi
 * /api/team-analysis:
 *   post:
 *     summary: Analiza composicion 5v5 y recomienda build para myChampion
 *     tags: [Team Analysis]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [myTeam, enemyTeam, myChampion]
 *             properties:
 *               myTeam:
 *                 type: array
 *                 minItems: 5
 *                 maxItems: 5
 *                 items:
 *                   type: string
 *               enemyTeam:
 *                 type: array
 *                 minItems: 5
 *                 maxItems: 5
 *                 items:
 *                   type: string
 *               myChampion:
 *                 type: string
 *     responses:
 *       200:
 *         description: Analisis de composicion generado correctamente
 *       400:
 *         description: Body invalido
 *       500:
 *         description: Error interno durante el analisis
 */
teamRoutes.post("/", analyzeMatch);

export default teamRoutes;
