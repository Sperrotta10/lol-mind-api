import type { Request, Response } from "express";
import { listItems } from "../services/itemService.js";

export const getItems = async (req: Request, res: Response): Promise<void> => {
	try {
		const filters: { search?: string | string[]; tag?: string | string[] } = {};

		if (req.query.search !== undefined) {
			filters.search = req.query.search as string | string[];
		}

		if (req.query.tag !== undefined) {
			filters.tag = req.query.tag as string | string[];
		}

		const items = await listItems(filters);

		res.status(200).json({
			success: true,
			data: items,
			meta: {
				requestId: res.locals.requestId,
			},
		});
	} catch (error: unknown) {
		console.error("[itemController.getItems] Error al listar items", {
			requestId: res.locals.requestId,
			error,
			stack: error instanceof Error ? error.stack : undefined,
		});

		const message = error instanceof Error ? error.message : "Error inesperado al listar items";

		res.status(500).json({
			success: false,
			error: {
				code: "ITEMS_FETCH_FAILED",
				message,
			},
			meta: {
				requestId: res.locals.requestId,
			},
		});
	}
};
