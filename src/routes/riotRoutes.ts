import { Router } from "express";
import { triggerSync } from "../controllers/riotController.js";

const riotRouter = Router();

/**
 * @openapi
 * /api/riot/sync:
 *   post:
 *     summary: Ejecuta sincronizacion manual con Riot Data Dragon
 *     tags: [Riot]
 *     responses:
 *       200:
 *         description: Sincronizacion completada correctamente
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
 *                     version:
 *                       type: string
 *                     championsSynced:
 *                       type: integer
 *                     itemsSynced:
 *                       type: integer
 *                     runesSynced:
 *                       type: integer
 *                 meta:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 *       500:
 *         description: Error interno al sincronizar datos de Riot
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 error:
 *                   type: object
 *                   properties:
 *                     code:
 *                       type: string
 *                     message:
 *                       type: string
 *                 meta:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 */
riotRouter.post("/sync", triggerSync);

export default riotRouter;
