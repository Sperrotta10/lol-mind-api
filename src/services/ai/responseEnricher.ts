import type {
	BaseBuildResponse,
	BuildItemReference,
	BuildRuneReference,
	ItemContext,
	MatchupBuildResponse,
	RawBaseBuildResponse,
	RawMatchupBuildResponse,
	RawStyleBuildResponse,
	RawTeamCompAnalysisResponse,
	RuneContext,
	RuneTreeReference,
	StyleBuildResponse,
	TeamCompAnalysisResponse,
} from "./types.js";
import { buildItemImageUrl, buildRuneImageUrl, buildRuneTreeImageUrl } from "../../utils/ddragonImageUrls.js";

const normalizeLookupValue = (value: string): string =>
	value
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/['’`]/g, "");

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

export const enrichMatchupBuildResponse = (
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

export const enrichStyleBuildResponse = (
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

export const enrichBaseBuildResponse = (
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

export const enrichTeamCompResponse = (
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
