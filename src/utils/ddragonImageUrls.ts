const D_DRAGON_CDN_BASE_URL = "https://ddragon.leagueoflegends.com/cdn";
const D_DRAGON_IMAGE_BASE_URL = "https://ddragon.leagueoflegends.com/cdn/img";

export const DEFAULT_DDRAGON_VERSION = "16.6.1";

const toSafePathSegment = (value: string): string => encodeURIComponent(value.trim());

export const buildChampionLoadingImageUrl = (loadingFileName: string): string =>
	`${D_DRAGON_IMAGE_BASE_URL}/champion/loading/${toSafePathSegment(loadingFileName)}`;

export const buildChampionSplashImageUrl = (splashFileName: string): string =>
	`${D_DRAGON_IMAGE_BASE_URL}/champion/splash/${toSafePathSegment(splashFileName)}`;

export const buildChampionAvatarImageUrl = (
	avatarFileName: string,
	version: string = DEFAULT_DDRAGON_VERSION,
): string => `${D_DRAGON_CDN_BASE_URL}/${version}/img/champion/${toSafePathSegment(avatarFileName)}`;

export const buildItemImageUrl = (
	imageFileName: string,
	version: string = DEFAULT_DDRAGON_VERSION,
): string => `${D_DRAGON_CDN_BASE_URL}/${version}/img/item/${toSafePathSegment(imageFileName)}`;

export const buildRuneIconUrl = (iconPath: string): string =>
	`${D_DRAGON_IMAGE_BASE_URL}/${iconPath.trim()}`;

export const buildVersionImageUrl = (version: string): string =>
	`${D_DRAGON_CDN_BASE_URL}/${version}/img/profileicon/0.png`;
