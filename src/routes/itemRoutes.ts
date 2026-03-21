import { Router } from "express";
import { getItems } from "../controllers/itemController.js";

const itemRoutes = Router();

/**
 * @openapi
 * /api/items:
 *   get:
 *     summary: Lista items con filtros opcionales
 *     tags: [Items]
 *     parameters:
 *       - in: query
 *         name: search
 *         required: false
 *         schema:
 *           type: string
 *         description: Busca por nombre o id de item
 *       - in: query
 *         name: tag
 *         required: false
 *         schema:
 *           type: string
 *         description: Filtra por tag de item (Armor, Damage, Mana, etc)
 *     responses:
 *       200:
 *         description: Items obtenidos correctamente
 *       500:
 *         description: Error interno al listar items
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
itemRoutes.get("/", getItems);

export default itemRoutes;
