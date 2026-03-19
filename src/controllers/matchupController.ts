import type { Request, Response } from "express";
import { generateBuild } from "../services/aiService.js";

interface MatchupRequestBody {
	champion?: string;
	enemy?: string;
}

export const analyzeMatchup = async (
	req: Request<unknown, unknown, MatchupRequestBody>,
	res: Response,
): Promise<void> => {
	try {
		const { champion, enemy } = req.body;

		if (!champion || !enemy) {
			res.status(400).json({
				success: false,
				error: {
					code: "INVALID_MATCHUP_INPUT",
					message: "Debes enviar champion y enemy en el body",
				},
				meta: {
					requestId: res.locals.requestId,
				},
			});
			return;
		}

		const analysis = await generateBuild(champion, enemy);

		res.status(200).json({
			success: true,
			data: analysis,
			meta: {
				requestId: res.locals.requestId,
			},
		});
	} catch (error: unknown) {
		console.error("[matchupController.analyzeMatchup] Error analizando matchup", {
			requestId: res.locals.requestId,
			error,
			stack: error instanceof Error ? error.stack : undefined,
		});

		const message = error instanceof Error ? error.message : "Error inesperado en analisis de matchup";

		res.status(500).json({
			success: false,
			error: {
				code: "MATCHUP_ANALYSIS_FAILED",
				message,
			},
			meta: {
				requestId: res.locals.requestId,
			},
		});
	}
};
