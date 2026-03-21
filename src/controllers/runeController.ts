import type { Request, Response } from "express";
import { listRunes } from "../services/runeService.js";

export const getRunes = async (req: Request, res: Response): Promise<void> => {
	try {
		const filters: { search?: string | string[]; tree?: string | string[]; slot?: string | string[] } = {};

		if (req.query.search !== undefined) {
			filters.search = req.query.search as string | string[];
		}

		if (req.query.tree !== undefined) {
			filters.tree = req.query.tree as string | string[];
		}

		if (req.query.slot !== undefined) {
			filters.slot = req.query.slot as string | string[];
		}

		const runes = await listRunes(filters);

		res.status(200).json({
			success: true,
			data: runes,
			meta: {
				requestId: res.locals.requestId,
			},
		});
	} catch (error: unknown) {
		console.error("[runeController.getRunes] Error al listar runas", {
			requestId: res.locals.requestId,
			error,
			stack: error instanceof Error ? error.stack : undefined,
		});

		const message = error instanceof Error ? error.message : "Error inesperado al listar runas";

		res.status(500).json({
			success: false,
			error: {
				code: "RUNES_FETCH_FAILED",
				message,
			},
			meta: {
				requestId: res.locals.requestId,
			},
		});
	}
};
