import type { Request, Response } from "express";
import { analyzeTeamComp, generateBaseBuild, generateBuild, generateStyleBuild } from "../services/aiService.js";

interface StyleBuildRequestBody {
	champion?: string;
	style?: string;
}

interface MatchupRequestBody {
	champion?: string;
	enemy?: string;
}

interface TeamAnalysisRequestBody {
	myTeam?: string[];
	enemyTeam?: string[];
	myChampion?: string;
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

export const getBaseBuild = async (
	req: Request<{ champion: string }>,
	res: Response,
): Promise<void> => {
	try {
		const champion = req.params.champion;

		if (!champion || !champion.trim()) {
			res.status(400).json({
				success: false,
				error: {
					code: "INVALID_BASE_BUILD_INPUT",
					message: "Debes enviar champion en los params",
				},
				meta: {
					requestId: res.locals.requestId,
				},
			});
			return;
		}

		const result = await generateBaseBuild(champion);

		res.status(200).json({
			success: true,
			data: result,
			meta: {
				requestId: res.locals.requestId,
			},
		});
	} catch (error: unknown) {
		console.error("[buildController.getBaseBuild] Error generando build base", {
			requestId: res.locals.requestId,
			error,
			stack: error instanceof Error ? error.stack : undefined,
		});

		const message = error instanceof Error ? error.message : "Error inesperado al generar build base";

		res.status(500).json({
			success: false,
			error: {
				code: "BASE_BUILD_FAILED",
				message,
			},
			meta: {
				requestId: res.locals.requestId,
			},
		});
	}
};

export const analyzeMatchupBuild = async (
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
		console.error("[buildController.analyzeMatchupBuild] Error analizando matchup", {
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

export const analyzeTeamBuild = async (
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
		console.error("[buildController.analyzeTeamBuild] Error analizando composicion 5v5", {
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
