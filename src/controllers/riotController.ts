import type { Request, Response } from "express";
import { syncRiotData } from "../services/riotDataService.js";

export const triggerSync = async (_req: Request, res: Response): Promise<void> => {
	try {
		const result = await syncRiotData();

		res.status(200).json({
			success: true,
			data: result,
			meta: {
				requestId: res.locals.requestId,
			},
		});
	} catch (error: unknown) {
		console.error("[riotController.triggerSync] Error al sincronizar Data Dragon", {
			requestId: res.locals.requestId,
			error,
			stack: error instanceof Error ? error.stack : undefined,
		});

		const message = error instanceof Error ? error.message : "Error inesperado en sincronizacion";

		res.status(500).json({
			success: false,
			error: {
				code: "RIOT_SYNC_FAILED",
				message,
			},
			meta: {
				requestId: res.locals.requestId,
			},
		});
	}
};
