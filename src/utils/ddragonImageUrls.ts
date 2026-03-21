const D_DRAGON_CDN_BASE_URL = "https://ddragon.leagueoflegends.com/cdn";
const D_DRAGON_IMAGE_BASE_URL = "https://ddragon.leagueoflegends.com/cdn/img";

export const DEFAULT_DDRAGON_VERSION = "16.6.1";

const RUNE_TREE_STYLE_IDS: Record<string, string> = {
	domination: "7200",
	precision: "7201",
	sorcery: "7202",
	inspiration: "7203",
	resolve: "7204",
};

const toSafePathSegment = (value: string): string => encodeURIComponent(value.trim());

export const buildChampionLoadingImageUrl = (championId: string): string =>
	`${D_DRAGON_IMAGE_BASE_URL}/champion/loading/${toSafePathSegment(championId)}_0.jpg`;

export const buildChampionSplashImageUrl = (championId: string): string =>
	`${D_DRAGON_IMAGE_BASE_URL}/champion/splash/${toSafePathSegment(championId)}_0.jpg`;

export const buildChampionAvatarImageUrl = (
	championId: string,
	version: string = DEFAULT_DDRAGON_VERSION,
): string => `${D_DRAGON_CDN_BASE_URL}/${version}/img/champion/${toSafePathSegment(championId)}.png`;

export const buildItemImageUrl = (
	itemId: string,
	version: string = DEFAULT_DDRAGON_VERSION,
): string => `${D_DRAGON_CDN_BASE_URL}/${version}/img/item/${toSafePathSegment(itemId)}.png`;

export const buildRuneImageUrl = (tree: string, runeKey: string): string =>
	`${D_DRAGON_IMAGE_BASE_URL}/perk-images/Styles/${toSafePathSegment(tree)}/${toSafePathSegment(runeKey)}/${toSafePathSegment(runeKey)}.png`;

export const buildRuneTreeImageUrl = (tree: string): string => {
	const normalizedTree = tree.trim().toLowerCase();
	const styleId = RUNE_TREE_STYLE_IDS[normalizedTree];

	if (!styleId) {
		return `${D_DRAGON_IMAGE_BASE_URL}/perk-images/Styles/${toSafePathSegment(tree)}.png`;
	}

	return `${D_DRAGON_IMAGE_BASE_URL}/perk-images/Styles/${styleId}_${toSafePathSegment(tree)}.png`;
};

export const buildVersionImageUrl = (version: string): string =>
	`${D_DRAGON_CDN_BASE_URL}/${version}/img/profileicon/0.png`;
