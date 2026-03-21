import { generateGeminiJson, generateGeminiJsonWithSchema } from "./ai/client.js";
import { findChampionByName, getItemContext, getRuneContext } from "./ai/contextRepository.js";
import { AIServiceError } from "./ai/errors.js";
import {
	buildBaseContextBlock,
	buildBaseResponseSchema,
	buildBaseSystemPrompt,
	buildBaseUserPrompt,
	buildMatchupContextBlock,
	buildMatchupSystemPrompt,
	buildMatchupUserPrompt,
	buildStyleContextBlock,
	buildStyleResponseSchema,
	buildStyleSystemPrompt,
	buildStyleUserPrompt,
	buildTeamCompContextBlock,
	buildTeamCompResponseSchema,
	buildTeamCompSystemPrompt,
	buildTeamCompUserPrompt,
	composePrompt,
} from "./ai/prompts/index.js";
import {
	parseBaseBuildResponse,
	parseMatchupResponse,
	parseStyleBuildResponse,
	parseTeamCompResponse,
} from "./ai/parsers/index.js";
import {
	enrichBaseBuildResponse,
	enrichMatchupBuildResponse,
	enrichStyleBuildResponse,
	enrichTeamCompResponse,
} from "./ai/responseEnricher.js";
import type {
	ChampionContext,
	BaseBuildResponse,
	MatchupBuildResponse,
	StyleBuildResponse,
	TeamCompAnalysisResponse,
} from "./ai/types.js";
import { env } from "../config/env.js";
export { AIServiceError };
export type { BaseBuildResponse, MatchupBuildResponse, StyleBuildResponse, TeamCompAnalysisResponse };

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

const getItemResolutionPool = async () =>
	getItemContext({
		minGoldTotal: 0,
		maxItems: 500,
		excludeBootsAndConsumables: false,
	});

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

	const [allyChampion, enemyChampion, items, runes, itemResolutionPool] = await Promise.all([
		findChampionByName(championName),
		findChampionByName(enemyName),
		getItemContext(),
		getRuneContext(),
		getItemResolutionPool(),
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

	const systemPrompt = buildMatchupSystemPrompt();
	const contextBlock = buildMatchupContextBlock({
		allyChampion,
		enemyChampion,
		items,
		runes,
	});
	const userPrompt = buildMatchupUserPrompt(allyChampion.name, enemyChampion.name);

	const composedPrompt = composePrompt({ systemPrompt, contextBlock, userPrompt });
	const rawText = await generateGeminiJson(env.GEMINI_API_KEY, composedPrompt);
	const parsedResponse = parseMatchupResponse(rawText);

	return enrichMatchupBuildResponse(parsedResponse, itemResolutionPool, runes);
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

	const [champion, items, runes, itemResolutionPool] = await Promise.all([
		findChampionByName(championName),
		getItemContext({ minGoldTotal: 1500, maxItems: 80 }),
		getRuneContext(),
		getItemResolutionPool(),
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

	const parsedResponse = parseStyleBuildResponse(rawText);

	return enrichStyleBuildResponse(parsedResponse, itemResolutionPool, runes);
};

export const generateBaseBuild = async (championName: string): Promise<BaseBuildResponse> => {
	if (!env.GEMINI_API_KEY) {
		throw new AIServiceError("AI_MISSING_API_KEY", "Falta GEMINI_API_KEY en variables de entorno");
	}

	if (!championName.trim()) {
		throw new AIServiceError("AI_INVALID_INPUT", "championName es obligatorio");
	}

	const [champion, itemPool, runePool, bootsPool, itemResolutionPool] = await Promise.all([
		findChampionByName(championName),
		getItemContext({ minGoldTotal: 1500, maxItems: 90, excludeBootsAndConsumables: true }),
		getRuneContext(),
		getItemContext({ minGoldTotal: 900, maxItems: 30, excludeBootsAndConsumables: false }),
		getItemResolutionPool(),
	]);

	if (!champion) {
		throw new AIServiceError("AI_CHAMPION_NOT_FOUND", "No se encontro el campeon en la base de datos", {
			championName,
		});
	}

	const bootPool = bootsPool.filter((item) => item.tags.includes("Boots"));

	const systemPrompt = buildBaseSystemPrompt();
	const contextBlock = buildBaseContextBlock({
		champion,
		itemPool,
		bootPool,
		runePool,
	});
	const userPrompt = buildBaseUserPrompt(champion.name);

	const composedPrompt = composePrompt({ systemPrompt, contextBlock, userPrompt });
	const rawText = await generateGeminiJsonWithSchema(env.GEMINI_API_KEY, composedPrompt, {
		responseSchema: buildBaseResponseSchema(),
	});

	const parsedResponse = parseBaseBuildResponse(rawText);

	return enrichBaseBuildResponse(parsedResponse, itemResolutionPool, runePool);
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

	const [myTeamChampions, enemyTeamChampions, itemPool, bootPool, itemResolutionPool] = await Promise.all([
		findChampionsByNames(myTeam),
		findChampionsByNames(enemyTeam),
		getItemContext({ minGoldTotal: 1700, maxItems: 80, excludeBootsAndConsumables: true }),
		getItemContext({ minGoldTotal: 900, maxItems: 20, excludeBootsAndConsumables: false }),
		getItemResolutionPool(),
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

	const parsedResponse = parseTeamCompResponse(rawText);

	return enrichTeamCompResponse(parsedResponse, itemResolutionPool);
};
