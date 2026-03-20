import { Router } from "express";
import { runDailySync } from "../controllers/cronController.js";

const cronRoutes = Router();

/**
 * @openapi
 * /api/admin/cron-sync:
 *   post:
 *     summary: Ejecuta sync protegido para cron externo
 *     tags: [Cron]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cron ejecutado correctamente
 *       401:
 *         description: Token de autorizacion invalido
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del cron
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
cronRoutes.post("/cron-sync", runDailySync);

export default cronRoutes;
