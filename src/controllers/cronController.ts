import type { Request, Response } from "express";
import { prisma } from "../config/db.js";
import { syncRiotData } from "../services/riotDataService.js";

const RIOT_VERSIONS_URL = "https://ddragon.leagueoflegends.com/api/versions.json";
const RIOT_FETCH_TIMEOUT_MS = 8000;

const fetchLatestRiotVersion = async (): Promise<string> => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), RIOT_FETCH_TIMEOUT_MS);

	try {
		const response = await fetch(RIOT_VERSIONS_URL, {
			signal: controller.signal,
			headers: {
				accept: "application/json",
			},
		});

		if (!response.ok) {
			throw new Error(`Riot versions request failed with status ${response.status}`);
		}

		const data: unknown = await response.json();

		if (!Array.isArray(data) || typeof data[0] !== "string") {
			throw new Error("Riot versions payload invalido");
		}

		return data[0];
	} finally {
		clearTimeout(timeoutId);
	}
};

export const runDailySync = async (_req: Request, res: Response): Promise<void> => {
	try {
		const authHeader = _req.headers.authorization;
		const cronSecret = process.env.CRON_SECRET;

		if (!cronSecret) {
			res.status(500).json({
				success: false,
				error: {
					code: "CRON_SECRET_NOT_CONFIGURED",
					message: "CRON_SECRET no esta configurado",
				},
				meta: {
					requestId: res.locals.requestId,
				},
			});
			return;
		}

		if (authHeader !== `Bearer ${cronSecret}`) {
			res.status(401).json({
				success: false,
				error: {
					code: "UNAUTHORIZED",
					message: "Token de cron invalido",
				},
				meta: {
					requestId: res.locals.requestId,
				},
			});
			return;
		}

		const riotVersion = await fetchLatestRiotVersion();

		const currentVersionRecord = await prisma.gameVersion.findFirst({
			where: { isCurrent: true },
			orderBy: { createdAt: "desc" },
		});

		const currentDbVersion = currentVersionRecord?.version;

		if (currentDbVersion !== riotVersion) {
			await syncRiotData();

			res.status(200).json({
				success: true,
				data: {
					message: "Base de datos actualizada",
					newVersion: riotVersion,
				},
				meta: {
					requestId: res.locals.requestId,
				},
			});
			return;
		}

		res.status(200).json({
			success: true,
			data: {
				message: "Ya estamos en la ultima version",
				version: riotVersion,
			},
			meta: {
				requestId: res.locals.requestId,
			},
		});
	} catch (error: unknown) {
		console.error("[cronController.runDailySync] Error ejecutando sync diario", {
			requestId: res.locals.requestId,
			error,
			stack: error instanceof Error ? error.stack : undefined,
		});

		const message = error instanceof Error ? error.message : "Error inesperado al ejecutar el cron sync";

		res.status(500).json({
			success: false,
			error: {
				code: "CRON_SYNC_FAILED",
				message,
			},
			meta: {
				requestId: res.locals.requestId,
			},
		});
	}
};
