import { Router } from "express";
import { analyzeMatchupBuild, analyzeTeamBuild, getBaseBuild, getStyleBuild } from "../controllers/buildController.js";

const buildRoutes = Router();

/**
 * @openapi
 * /api/builds/style:
 *   post:
 *     summary: Genera build theorycrafting por estilo para un campeon
 *     tags: [Builds]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [champion, style]
 *             properties:
 *               champion:
 *                 type: string
 *                 example: "Garen"
 *               style:
 *                 type: string
 *                 example: "Letalidad"
 *     responses:
 *       200:
 *         description: Build generada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     coreItems:
 *                       type: array
 *                       items:
 *                         type: string
 *                     situationalItems:
 *                       type: array
 *                       items:
 *                         type: string
 *                     runes:
 *                       type: object
 *                     playstyleExplanation:
 *                       type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 *       400:
 *         description: Body invalido
 *       500:
 *         description: Error interno al generar la build
 */
buildRoutes.post("/style", getStyleBuild);

/**
 * @openapi
 * /api/builds/matchup:
 *   post:
 *     summary: Analiza un 1v1 y genera recomendaciones de build
 *     tags: [Builds]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [champion, enemy]
 *             properties:
 *               champion:
 *                 type: string
 *                 example: "Ahri"
 *               enemy:
 *                 type: string
 *                 example: "Zed"
 *     responses:
 *       200:
 *         description: Analisis generado correctamente
 *       400:
 *         description: Body invalido
 *       500:
 *         description: Error interno durante el analisis
 */
buildRoutes.post("/matchup", analyzeMatchupBuild);

/**
 * @openapi
 * /api/builds/team-analysis:
 *   post:
 *     summary: Analiza composicion 5v5 y recomienda build para myChampion
 *     tags: [Builds]
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
buildRoutes.post("/team-analysis", analyzeTeamBuild);

/**
 * @openapi
 * /api/builds/base/{champion}:
 *   get:
 *     summary: Genera build base (meta estandar) para un campeon
 *     tags: [Builds]
 *     parameters:
 *       - in: path
 *         name: champion
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Build base generada correctamente
 *       400:
 *         description: Parametro champion invalido
 *       500:
 *         description: Error interno al generar la build base
 */
buildRoutes.get("/base/:champion", getBaseBuild);

export default buildRoutes;
