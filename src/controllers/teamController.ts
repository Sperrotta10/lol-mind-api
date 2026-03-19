import type { Request, Response } from "express";
import { analyzeTeamComp } from "../services/aiService.js";

interface TeamAnalysisRequestBody {
	myTeam?: string[];
	enemyTeam?: string[];
	myChampion?: string;
}

export const analyzeMatch = async (
	req: Request<unknown, unknown, TeamAnalysisRequestBody>,
	res: Response,
): Promise<void> => {
	try {
		const { myTeam, enemyTeam, myChampion } = req.body;

		if (!Array.isArray(myTeam) || !Array.isArray(enemyTeam) || typeof myChampion !== "string") {
			res.status(400).json({
				success: false,
				error: {
					code: "INVALID_TEAM_ANALYSIS_INPUT",
					message: "Debes enviar myTeam, enemyTeam y myChampion con formato valido",
				},
				meta: {
					requestId: res.locals.requestId,
				},
			});
			return;
		}

		const analysis = await analyzeTeamComp(myTeam, enemyTeam, myChampion);

		res.status(200).json({
			success: true,
			data: analysis,
			meta: {
				requestId: res.locals.requestId,
			},
		});
	} catch (error: unknown) {
		console.error("[teamController.analyzeMatch] Error analizando composicion 5v5", {
			requestId: res.locals.requestId,
			error,
			stack: error instanceof Error ? error.stack : undefined,
		});

		const message = error instanceof Error ? error.message : "Error inesperado en analisis 5v5";

		res.status(500).json({
			success: false,
			error: {
				code: "TEAM_ANALYSIS_FAILED",
				message,
			},
			meta: {
				requestId: res.locals.requestId,
			},
		});
	}
};
