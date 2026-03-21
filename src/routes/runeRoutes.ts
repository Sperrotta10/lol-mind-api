import { Router } from "express";
import { getRunes } from "../controllers/runeController.js";

const runeRoutes = Router();

/**
 * @openapi
 * /api/runes:
 *   get:
 *     summary: Lista runas con filtros opcionales
 *     tags: [Runes]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Busca por nombre o key de runa
 *       - in: query
 *         name: tree
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra por rama (Precision, Domination, Sorcery, Resolve, Inspiration)
 *       - in: query
 *         name: slot
 *         required: false
 *         schema:
 *           type: integer
 *         description: Filtra por slot (0 keystone, 1 a 3 runas menores)
 *     responses:
 *       200:
 *         description: Runas obtenidas correctamente
 *       500:
 *         description: Error interno al listar runas
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
runeRoutes.get("/", getRunes);

export default runeRoutes;
