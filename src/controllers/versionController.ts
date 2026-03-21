import type { Request, Response } from "express";
import { listVersions } from "../services/versionService.js";

export const getVersions = async (_req: Request, res: Response): Promise<void> => {
	try {
		const versions = await listVersions();

		res.status(200).json({
			success: true,
			data: versions,
			meta: {
				requestId: res.locals.requestId,
			},
		});
	} catch (error: unknown) {
		console.error("[versionController.getVersions] Error al listar versiones", {
			requestId: res.locals.requestId,
			error,
			stack: error instanceof Error ? error.stack : undefined,
		});

		const message = error instanceof Error ? error.message : "Error inesperado al listar versiones";

		res.status(500).json({
			success: false,
			error: {
				code: "VERSIONS_FETCH_FAILED",
				message,
			},
			meta: {
				requestId: res.locals.requestId,
			},
		});
	}
};
