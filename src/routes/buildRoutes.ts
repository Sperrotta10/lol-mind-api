import { Router } from "express";
import { getBaseBuild, getStyleBuild } from "../controllers/buildController.js";

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
