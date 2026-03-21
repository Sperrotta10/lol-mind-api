import { Router } from "express";
import { getVersions } from "../controllers/versionController.js";

const versionRoutes = Router();

/**
 * @openapi
 * /api/versions:
 *   get:
 *     summary: Lista las versiones de juego sincronizadas
 *     tags: [Versions]
 *     responses:
 *       200:
 *         description: Versiones obtenidas correctamente
 *       500:
 *         description: Error interno al listar versiones
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
versionRoutes.get("/", getVersions);

export default versionRoutes;
