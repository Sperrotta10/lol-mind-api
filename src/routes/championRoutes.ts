import { Router } from "express";
import { getChampions } from "../controllers/championController.js";

const championRoutes = Router();

/**
 * @openapi
 * /api/champions:
 *   get:
 *     summary: Lista campeones con filtros opcionales
 *     tags: [Champions]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Busca por nombre o id de campeon
 *       - in: query
 *         name: tag
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra por rol/tag (Fighter, Mage, Tank, etc)
 *     responses:
 *       200:
 *         description: Campeones obtenidos correctamente
 *       500:
 *         description: Error interno al listar campeones
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
championRoutes.get("/", getChampions);

export default championRoutes;
