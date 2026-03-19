import { generateGeminiJson, generateGeminiJsonWithSchema } from "./ai/client.js";
import { findChampionByName, getItemContext, getRuneContext } from "./ai/context.js";
import { AIServiceError } from "./ai/errors.js";
import { parseMatchupResponse } from "./ai/parser.js";
import {
	buildContextBlock,
	buildSystemPrompt,
	buildUserPrompt,
	composePrompt,
} from "./ai/prompt.js";
import {
	buildStyleContextBlock,
	buildStyleResponseSchema,
	buildStyleSystemPrompt,
	buildStyleUserPrompt,
	parseStyleBuildResponse,
} from "./ai/style.js";
import {
	buildTeamCompContextBlock,
	buildTeamCompResponseSchema,
	buildTeamCompSystemPrompt,
	buildTeamCompUserPrompt,
	parseTeamCompResponse,
} from "./ai/teamComp.js";
import type {
	ChampionContext,
	MatchupBuildResponse,
	StyleBuildResponse,
	TeamCompAnalysisResponse,
} from "./ai/types.js";
import { env } from "../config/env.js";
export { AIServiceError };
export type { MatchupBuildResponse, StyleBuildResponse, TeamCompAnalysisResponse };

const findChampionsByNames = async (championNames: string[]): Promise<ChampionContext[]> => {
	const champions = await Promise.all(championNames.map((championName) => findChampionByName(championName)));

	const missingChampions: string[] = [];
	const resolvedChampions: ChampionContext[] = [];

	champions.forEach((champion, index) => {
		if (champion) {
			resolvedChampions.push(champion);
			return;
		}

		missingChampions.push(championNames[index] ?? "unknown");
	});

	if (missingChampions.length > 0) {
		throw new AIServiceError("AI_CHAMPION_NOT_FOUND", "No se encontraron campeones en la base de datos", {
			missingChampions,
		});
	}

	return resolvedChampions;
};

export const generateBuild = async (
	championName: string,
	enemyName: string,
): Promise<MatchupBuildResponse> => {
	if (!env.GEMINI_API_KEY) {
		throw new AIServiceError("AI_MISSING_API_KEY", "Falta GEMINI_API_KEY en variables de entorno");
	}

	if (!championName.trim() || !enemyName.trim()) {
		throw new AIServiceError("AI_INVALID_INPUT", "championName y enemyName son obligatorios");
	}

	const [allyChampion, enemyChampion, items, runes] = await Promise.all([
		findChampionByName(championName),
		findChampionByName(enemyName),
		getItemContext(),
		getRuneContext(),
	]);

	if (!allyChampion || !enemyChampion) {
		throw new AIServiceError(
			"AI_CHAMPION_NOT_FOUND",
			"No se encontro uno o ambos campeones en la base de datos",
			{
				championName,
				enemyName,
				allyFound: Boolean(allyChampion),
				enemyFound: Boolean(enemyChampion),
			},
		);
	}

	const systemPrompt = buildSystemPrompt();
	const contextBlock = buildContextBlock({
		allyChampion,
		enemyChampion,
		items,
		runes,
	});
	const userPrompt = buildUserPrompt(allyChampion.name, enemyChampion.name);

	const composedPrompt = composePrompt({ systemPrompt, contextBlock, userPrompt });
	const rawText = await generateGeminiJson(env.GEMINI_API_KEY, composedPrompt);
	return parseMatchupResponse(rawText);
};

export const generateStyleBuild = async (
	championName: string,
	style: string,
): Promise<StyleBuildResponse> => {
	if (!env.GEMINI_API_KEY) {
		throw new AIServiceError("AI_MISSING_API_KEY", "Falta GEMINI_API_KEY en variables de entorno");
	}

	if (!championName.trim() || !style.trim()) {
		throw new AIServiceError("AI_INVALID_INPUT", "championName y style son obligatorios");
	}

	const [champion, items, runes] = await Promise.all([
		findChampionByName(championName),
		getItemContext({ minGoldTotal: 1500, maxItems: 80 }),
		getRuneContext(),
	]);

	if (!champion) {
		throw new AIServiceError("AI_CHAMPION_NOT_FOUND", "No se encontro el campeon en la base de datos", {
			championName,
		});
	}

	const systemPrompt = buildStyleSystemPrompt();
	const contextBlock = buildStyleContextBlock({
		champion,
		style: style.trim(),
		items,
		runes,
	});
	const userPrompt = buildStyleUserPrompt(champion.name, style.trim());

	const composedPrompt = composePrompt({ systemPrompt, contextBlock, userPrompt });
	const rawText = await generateGeminiJsonWithSchema(env.GEMINI_API_KEY, composedPrompt, {
		responseSchema: buildStyleResponseSchema(),
	});

	return parseStyleBuildResponse(rawText);
};

export const analyzeTeamComp = async (
	myTeam: string[],
	enemyTeam: string[],
	myChampion: string,
): Promise<TeamCompAnalysisResponse> => {
	if (!env.GEMINI_API_KEY) {
		throw new AIServiceError("AI_MISSING_API_KEY", "Falta GEMINI_API_KEY en variables de entorno");
	}

	if (myTeam.length !== 5 || enemyTeam.length !== 5 || !myChampion.trim()) {
		throw new AIServiceError(
			"AI_INVALID_INPUT",
			"myTeam y enemyTeam deben tener 5 campeones, y myChampion es obligatorio",
		);
	}

	const [myTeamChampions, enemyTeamChampions, itemPool, bootPool] = await Promise.all([
		findChampionsByNames(myTeam),
		findChampionsByNames(enemyTeam),
		getItemContext({ minGoldTotal: 1700, maxItems: 80, excludeBootsAndConsumables: true }),
		getItemContext({ minGoldTotal: 900, maxItems: 20, excludeBootsAndConsumables: false }),
	]);

	const myChampionContext = myTeamChampions.find(
		(champion) =>
			champion.name.toLowerCase() === myChampion.trim().toLowerCase()
			|| champion.id.toLowerCase() === myChampion.trim().toLowerCase(),
	);

	if (!myChampionContext) {
		throw new AIServiceError("AI_CHAMPION_NOT_IN_TEAM", "myChampion debe existir dentro de myTeam", {
			myChampion,
			myTeam,
		});
	}

	const onlyBoots = bootPool.filter((item) => item.tags.includes("Boots"));

	const systemPrompt = buildTeamCompSystemPrompt();
	const contextBlock = buildTeamCompContextBlock({
		myTeam: myTeamChampions,
		enemyTeam: enemyTeamChampions,
		myChampion: myChampionContext,
		itemPool,
		bootPool: onlyBoots,
	});
	const userPrompt = buildTeamCompUserPrompt();

	const composedPrompt = composePrompt({ systemPrompt, contextBlock, userPrompt });
	const rawText = await generateGeminiJsonWithSchema(env.GEMINI_API_KEY, composedPrompt, {
		responseSchema: buildTeamCompResponseSchema(),
	});

	return parseTeamCompResponse(rawText);
};
