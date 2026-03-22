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
import { buildItemImageUrl, buildRuneIconUrl } from "../../utils/ddragonImageUrls.js";

const normalizeLookupValue = (value: string): string =>
	value
		.trim()
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/['’`]/g, "");

const findItemMatch = (itemIdentifier: string, items: ItemContext[]): ItemContext | undefined => {
	const normalizedIdentifier = normalizeLookupValue(itemIdentifier);
	const trimmedIdentifier = itemIdentifier.trim();

	return items.find(
		(item) =>
			item.id === trimmedIdentifier
			|| normalizeLookupValue(item.id) === normalizedIdentifier
			|| normalizeLookupValue(item.name) === normalizedIdentifier,
	);
};

const findRuneMatch = (runeIdentifier: string, runes: RuneContext[]): RuneContext | undefined => {
	const normalizedIdentifier = normalizeLookupValue(runeIdentifier);
	const trimmedIdentifier = runeIdentifier.trim();

	return runes.find(
		(rune) =>
			rune.id.toString() === trimmedIdentifier
			|| normalizeLookupValue(rune.name) === normalizedIdentifier
			|| normalizeLookupValue(rune.key) === normalizedIdentifier,
	);
};

const toBuildItemReference = (itemIdentifier: string, items: ItemContext[]): BuildItemReference => {
	const normalizedIdentifier = itemIdentifier.trim();
	const matchedItem = findItemMatch(normalizedIdentifier, items);

	return {
		id: matchedItem?.id ?? null,
		name: matchedItem?.name ?? normalizedIdentifier,
		image: matchedItem ? buildItemImageUrl(matchedItem.image) : null,
	};
};

const toBuildItemReferenceStrict = (
	itemIdentifier: string,
	items: ItemContext[],
): BuildItemReference | undefined => {
	const matchedItem = findItemMatch(itemIdentifier, items);

	if (!matchedItem) {
		return undefined;
	}

	return {
		id: matchedItem.id,
		name: matchedItem.name,
		image: buildItemImageUrl(matchedItem.image),
	};
};

const toBuildRuneReferenceStrict = (
	runeIdentifier: string,
	runes: RuneContext[],
): BuildRuneReference | undefined => {
	const matchedRune = findRuneMatch(runeIdentifier, runes);

	if (!matchedRune) {
		return undefined;
	}

	return {
		id: matchedRune.id,
		key: matchedRune.key,
		name: matchedRune.name,
		tree: matchedRune.tree,
		image: buildRuneIconUrl(matchedRune.icon),
		treeImage: buildRuneIconUrl(matchedRune.treeIcon),
	};
};

const mapStrictItems = (
	identifiers: string[],
	itemPool: ItemContext[],
): BuildItemReference[] =>
	identifiers
		.map((identifier) => toBuildItemReferenceStrict(identifier, itemPool))
		.filter((item): item is BuildItemReference => item !== undefined);

const mapStrictRunes = (
	identifiers: string[],
	runePool: RuneContext[],
): BuildRuneReference[] =>
	identifiers
		.map((identifier) => toBuildRuneReferenceStrict(identifier, runePool))
		.filter((rune): rune is BuildRuneReference => rune !== undefined);

const buildEnrichedRunes = (
	rawRunes: {
		primaryTree: string;
		primaryChoices: string[];
		secondaryTree: string;
		secondaryChoices: string[];
		shards: string[];
	},
	runePool: RuneContext[],
) => ({
	primaryTree: toRuneTreeReference(rawRunes.primaryTree, runePool),
	primaryChoices: mapStrictRunes(rawRunes.primaryChoices, runePool),
	secondaryTree: toRuneTreeReference(rawRunes.secondaryTree, runePool),
	secondaryChoices: mapStrictRunes(rawRunes.secondaryChoices, runePool),
	shards: rawRunes.shards,
});

const toRuneTreeReference = (treeName: string, runes: RuneContext[]): RuneTreeReference => {
	const normalizedTreeName = treeName.trim();
	const normalizedLookup = normalizeLookupValue(normalizedTreeName);
	const matchedTree = runes.find((rune) => normalizeLookupValue(rune.tree) === normalizedLookup);

	if (!matchedTree) {
		return {
			name: normalizedTreeName,
			image: null,
		};
	}

	return {
		name: matchedTree.tree,
		image: buildRuneIconUrl(matchedTree.treeIcon),
	};
};

export const enrichMatchupBuildResponse = (
	rawResponse: RawMatchupBuildResponse,
	itemPool: ItemContext[],
	runePool: RuneContext[],
): MatchupBuildResponse => ({
	matchup: rawResponse.matchup,
	build: {
		startingItems: mapStrictItems(rawResponse.build.startingItems, itemPool),
		coreItems: mapStrictItems(rawResponse.build.coreItems, itemPool),
		situationalItems: mapStrictItems(rawResponse.build.situationalItems, itemPool),
		boots: toBuildItemReference(rawResponse.build.boots, itemPool),
	},
	runes: buildEnrichedRunes(rawResponse.runes, runePool),
	microPlan: rawResponse.microPlan,
});

export const enrichStyleBuildResponse = (
	rawResponse: RawStyleBuildResponse,
	itemPool: ItemContext[],
	runePool: RuneContext[],
): StyleBuildResponse => ({
	coreItems: mapStrictItems(rawResponse.coreItems, itemPool),
	situationalItems: mapStrictItems(rawResponse.situationalItems, itemPool),
	runes: buildEnrichedRunes(rawResponse.runes, runePool),
	playstyleExplanation: rawResponse.playstyleExplanation,
});

export const enrichBaseBuildResponse = (
	rawResponse: RawBaseBuildResponse,
	itemPool: ItemContext[],
	runePool: RuneContext[],
): BaseBuildResponse => ({
	coreItems: mapStrictItems(rawResponse.coreItems, itemPool),
	situationalItems: mapStrictItems(rawResponse.situationalItems, itemPool),
	boots: toBuildItemReference(rawResponse.boots, itemPool),
	runes: buildEnrichedRunes(rawResponse.runes, runePool),
});

export const enrichTeamCompResponse = (
	rawResponse: RawTeamCompAnalysisResponse,
	itemPool: ItemContext[],
): TeamCompAnalysisResponse => ({
	composition: rawResponse.composition,
	recommendedBuild: {
		coreItems: mapStrictItems(rawResponse.recommendedBuild.coreItems, itemPool),
		situationalItems: mapStrictItems(rawResponse.recommendedBuild.situationalItems, itemPool),
		boots: toBuildItemReference(rawResponse.recommendedBuild.boots, itemPool),
	},
	explanation: rawResponse.explanation,
});
