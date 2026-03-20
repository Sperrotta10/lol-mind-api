import { Router } from "express";
import { analyzeMatchup } from "../controllers/matchupController.js";

const matchupRoutes = Router();

/**
 * @openapi
 * /api/matchup:
 *   post:
 *     summary: Analiza un 1v1 y genera recomendaciones
 *     tags: [Matchup]
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno durante el analisis
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
matchupRoutes.post("/", analyzeMatchup);

export default matchupRoutes;
