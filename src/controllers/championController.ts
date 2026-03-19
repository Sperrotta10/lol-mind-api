import type { Request, Response } from "express";
import { listChampions } from "../services/championService.js";

export const getChampions = async (req: Request, res: Response): Promise<void> => {
	try {
		const filters: { search?: string | string[]; tag?: string | string[] } = {};

		if (req.query.search !== undefined) {
			filters.search = req.query.search as string | string[];
		}

		if (req.query.tag !== undefined) {
			filters.tag = req.query.tag as string | string[];
		}

		const champions = await listChampions(filters);

		res.status(200).json({
			success: true,
			data: champions,
			meta: {
				requestId: res.locals.requestId,
			},
		});
	} catch (error: unknown) {
		console.error("[championController.getChampions] Error al listar campeones", {
			requestId: res.locals.requestId,
			error,
			stack: error instanceof Error ? error.stack : undefined,
		});

		const message = error instanceof Error ? error.message : "Error inesperado al listar campeones";

		res.status(500).json({
			success: false,
			error: {
				code: "CHAMPIONS_FETCH_FAILED",
				message,
			},
			meta: {
				requestId: res.locals.requestId,
			},
		});
	}
};
