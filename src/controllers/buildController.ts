import type { Request, Response } from "express";
import { generateStyleBuild } from "../services/aiService.js";

interface StyleBuildRequestBody {
	champion?: string;
	style?: string;
}

export const getStyleBuild = async (
	req: Request<unknown, unknown, StyleBuildRequestBody>,
	res: Response,
): Promise<void> => {
	try {
		const { champion, style } = req.body;

		if (!champion || !style) {
			res.status(400).json({
				success: false,
				error: {
					code: "INVALID_STYLE_BUILD_INPUT",
					message: "Debes enviar champion y style en el body",
				},
				meta: {
					requestId: res.locals.requestId,
				},
			});
			return;
		}

		const result = await generateStyleBuild(champion, style);

		res.status(200).json({
			success: true,
			data: result,
			meta: {
				requestId: res.locals.requestId,
			},
		});
	} catch (error: unknown) {
		console.error("[buildController.getStyleBuild] Error generando build por estilo", {
			requestId: res.locals.requestId,
			error,
			stack: error instanceof Error ? error.stack : undefined,
		});

		const message = error instanceof Error ? error.message : "Error inesperado al generar build por estilo";

		res.status(500).json({
			success: false,
			error: {
				code: "STYLE_BUILD_FAILED",
				message,
			},
			meta: {
				requestId: res.locals.requestId,
			},
		});
	}
};
