import { generateGeminiJson, generateGeminiJsonWithSchema } from "./ai/client.js";
import { findChampionByName, getItemContext, getRuneContext } from "./ai/context.js";
import { AIServiceError } from "./ai/errors.js";
import { parseMatchupResponse } from "./ai/parser.js";
import {
	buildContextBlock,
	buildSystemPrompt,
	buildUserPrompt,
	composePrompt,
} from "./ai/matchupPrompt.js";
import {
	buildBaseContextBlock,
	buildBaseResponseSchema,
	buildBaseSystemPrompt,
	buildBaseUserPrompt,
	parseBaseBuildResponse,
} from "./ai/buildBasePrompt.js";
import {
	buildStyleContextBlock,
	buildStyleResponseSchema,
	buildStyleSystemPrompt,
	buildStyleUserPrompt,
	parseStyleBuildResponse,
} from "./ai/styleBuildPrompt.js";
import {
	buildTeamCompContextBlock,
	buildTeamCompResponseSchema,
	buildTeamCompSystemPrompt,
	buildTeamCompUserPrompt,
	parseTeamCompResponse,
} from "./ai/teamCompositionPrompt.js";
import type {
	BuildItemReference,
	BuildRuneReference,
	ChampionContext,
	BaseBuildResponse,
	MatchupBuildResponse,
	RawBaseBuildResponse,
	RawMatchupBuildResponse,
	RawStyleBuildResponse,
	RawTeamCompAnalysisResponse,
	RuneContext,
	RuneTreeReference,
	StyleBuildResponse,
	TeamCompAnalysisResponse,
	ItemContext,
} from "./ai/types.js";
import { env } from "../config/env.js";
import {
	buildItemImageUrl,
	buildRuneImageUrl,
	buildRuneTreeImageUrl,
} from "../utils/ddragonImageUrls.js";
export { AIServiceError };
export type { BaseBuildResponse, MatchupBuildResponse, StyleBuildResponse, TeamCompAnalysisResponse };

const normalizeLookupValue = (value: string): string => value.trim().toLowerCase();

const findItemMatch = (itemName: string, items: ItemContext[]): ItemContext | undefined => {
	const normalizedName = normalizeLookupValue(itemName);

	return items.find((item) => normalizeLookupValue(item.name) === normalizedName);
};

const findRuneMatch = (runeName: string, runes: RuneContext[]): RuneContext | undefined => {
	const normalizedName = normalizeLookupValue(runeName);

	return runes.find(
		(rune) =>
			normalizeLookupValue(rune.name) === normalizedName
			|| normalizeLookupValue(rune.key) === normalizedName,
	);
};

const toBuildItemReference = (itemName: string, items: ItemContext[]): BuildItemReference => {
	const normalizedName = itemName.trim();
	const matchedItem = findItemMatch(normalizedName, items);

	return {
		id: matchedItem?.id ?? null,
		name: normalizedName,
		image: matchedItem ? buildItemImageUrl(matchedItem.id) : null,
	};
};

const toBuildRuneReference = (runeName: string, runes: RuneContext[]): BuildRuneReference => {
	const normalizedName = runeName.trim();
	const matchedRune = findRuneMatch(normalizedName, runes);

	if (!matchedRune) {
		return {
			id: null,
			key: null,
			name: normalizedName,
			tree: null,
			image: null,
			treeImage: null,
		};
	}

	return {
		id: matchedRune.id,
		key: matchedRune.key,
		name: matchedRune.name,
		tree: matchedRune.tree,
		image: buildRuneImageUrl(matchedRune.tree, matchedRune.key),
		treeImage: buildRuneTreeImageUrl(matchedRune.tree),
	};
};

const toRuneTreeReference = (treeName: string, runes: RuneContext[]): RuneTreeReference => {
	const normalizedTreeName = treeName.trim();
	const normalizedLookup = normalizeLookupValue(normalizedTreeName);
	const matchedTree = runes.find((rune) => normalizeLookupValue(rune.tree) === normalizedLookup);
	const resolvedTree = matchedTree?.tree ?? normalizedTreeName;

	if (!resolvedTree) {
		return {
			name: normalizedTreeName,
			image: null,
		};
	}

	return {
		name: resolvedTree,
		image: buildRuneTreeImageUrl(resolvedTree),
	};
};

const enrichMatchupBuildResponse = (
	rawResponse: RawMatchupBuildResponse,
	itemPool: ItemContext[],
	runePool: RuneContext[],
): MatchupBuildResponse => ({
	matchup: rawResponse.matchup,
	build: {
		startingItems: rawResponse.build.startingItems.map((itemName) =>
			toBuildItemReference(itemName, itemPool),
		),
		coreItems: rawResponse.build.coreItems.map((itemName) =>
			toBuildItemReference(itemName, itemPool),
		),
		situationalItems: rawResponse.build.situationalItems.map((itemName) =>
			toBuildItemReference(itemName, itemPool),
		),
		boots: toBuildItemReference(rawResponse.build.boots, itemPool),
	},
	runes: {
		primaryTree: toRuneTreeReference(rawResponse.runes.primaryTree, runePool),
		primaryChoices: rawResponse.runes.primaryChoices.map((runeName) =>
			toBuildRuneReference(runeName, runePool),
		),
		secondaryTree: toRuneTreeReference(rawResponse.runes.secondaryTree, runePool),
		secondaryChoices: rawResponse.runes.secondaryChoices.map((runeName) =>
			toBuildRuneReference(runeName, runePool),
		),
		shards: rawResponse.runes.shards,
	},
	microPlan: rawResponse.microPlan,
});

const enrichStyleBuildResponse = (
	rawResponse: RawStyleBuildResponse,
	itemPool: ItemContext[],
	runePool: RuneContext[],
): StyleBuildResponse => ({
	coreItems: rawResponse.coreItems.map((itemName) => toBuildItemReference(itemName, itemPool)),
	situationalItems: rawResponse.situationalItems.map((itemName) =>
		toBuildItemReference(itemName, itemPool),
	),
	runes: {
		primaryTree: toRuneTreeReference(rawResponse.runes.primaryTree, runePool),
		primaryChoices: rawResponse.runes.primaryChoices.map((runeName) =>
			toBuildRuneReference(runeName, runePool),
		),
		secondaryTree: toRuneTreeReference(rawResponse.runes.secondaryTree, runePool),
		secondaryChoices: rawResponse.runes.secondaryChoices.map((runeName) =>
			toBuildRuneReference(runeName, runePool),
		),
		shards: rawResponse.runes.shards,
	},
	playstyleExplanation: rawResponse.playstyleExplanation,
});

const enrichBaseBuildResponse = (
	rawResponse: RawBaseBuildResponse,
	itemPool: ItemContext[],
	runePool: RuneContext[],
): BaseBuildResponse => ({
	coreItems: rawResponse.coreItems.map((itemName) => toBuildItemReference(itemName, itemPool)),
	situationalItems: rawResponse.situationalItems.map((itemName) =>
		toBuildItemReference(itemName, itemPool),
	),
	boots: toBuildItemReference(rawResponse.boots, itemPool),
	runes: {
		primaryTree: toRuneTreeReference(rawResponse.runes.primaryTree, runePool),
		primaryChoices: rawResponse.runes.primaryChoices.map((runeName) =>
			toBuildRuneReference(runeName, runePool),
		),
		secondaryTree: toRuneTreeReference(rawResponse.runes.secondaryTree, runePool),
		secondaryChoices: rawResponse.runes.secondaryChoices.map((runeName) =>
			toBuildRuneReference(runeName, runePool),
		),
		shards: rawResponse.runes.shards,
	},
});

const enrichTeamCompResponse = (
	rawResponse: RawTeamCompAnalysisResponse,
	itemPool: ItemContext[],
): TeamCompAnalysisResponse => ({
	composition: rawResponse.composition,
	recommendedBuild: {
		coreItems: rawResponse.recommendedBuild.coreItems.map((itemName) =>
			toBuildItemReference(itemName, itemPool),
		),
		situationalItems: rawResponse.recommendedBuild.situationalItems.map((itemName) =>
			toBuildItemReference(itemName, itemPool),
		),
		boots: toBuildItemReference(rawResponse.recommendedBuild.boots, itemPool),
	},
	explanation: rawResponse.explanation,
});

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
	const parsedResponse = parseMatchupResponse(rawText);

	return enrichMatchupBuildResponse(parsedResponse, items, runes);
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

	const parsedResponse = parseStyleBuildResponse(rawText);

	return enrichStyleBuildResponse(parsedResponse, items, runes);
};

export const generateBaseBuild = async (championName: string): Promise<BaseBuildResponse> => {
	if (!env.GEMINI_API_KEY) {
		throw new AIServiceError("AI_MISSING_API_KEY", "Falta GEMINI_API_KEY en variables de entorno");
	}

	if (!championName.trim()) {
		throw new AIServiceError("AI_INVALID_INPUT", "championName es obligatorio");
	}

	const [champion, itemPool, runePool, bootsPool] = await Promise.all([
		findChampionByName(championName),
		getItemContext({ minGoldTotal: 1500, maxItems: 90, excludeBootsAndConsumables: true }),
		getRuneContext(),
		getItemContext({ minGoldTotal: 900, maxItems: 30, excludeBootsAndConsumables: false }),
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

	return enrichBaseBuildResponse(parsedResponse, [...itemPool, ...bootPool], runePool);
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

	const parsedResponse = parseTeamCompResponse(rawText);

	return enrichTeamCompResponse(parsedResponse, [...itemPool, ...onlyBoots]);
};
