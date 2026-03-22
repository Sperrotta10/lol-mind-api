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
		console.error("[riotController.triggerSync] Error al sincronizar Data Dragon");
		console.error(error);

		if (error instanceof Error) {
			res.status(500).json({
				error: error.message,
				stack: error.stack,
			});
			return;
		}

		res.status(500).json({
			error: "Error inesperado en sincronizacion",
			stack: undefined,
		});
	}
};
