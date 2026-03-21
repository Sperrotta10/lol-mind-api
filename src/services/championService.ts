import { prisma } from "../config/db.js";
import {
	buildChampionAvatarImageUrl,
	buildChampionLoadingImageUrl,
	buildChampionSplashImageUrl,
	DEFAULT_DDRAGON_VERSION,
} from "../utils/ddragonImageUrls.js";

interface ChampionListItem {
	id: string;
	name: string;
	title: string;
	tags: string[];
	image: string;
	avatar: string;
	splash: string;
}

interface ChampionFilters {
	search?: string | string[];
	tag?: string | string[];
}

const normalizeTag = (value: string): string => {
	const normalized = value.trim().toLowerCase();
	const tagMap: Record<string, string> = {
		fighter: "Fighter",
		tank: "Tank",
		mage: "Mage",
		assassin: "Assassin",
		marksman: "Marksman",
		support: "Support",
	};

	return tagMap[normalized] ?? value.trim();
};

const parseSearchQuery = (value: string | string[] | undefined): string | undefined => {
	if (typeof value === "string") {
		const parsed = value.trim();
		return parsed.length > 0 ? parsed : undefined;
	}

	if (Array.isArray(value) && typeof value[0] === "string") {
		const parsed = value[0].trim();
		return parsed.length > 0 ? parsed : undefined;
	}

	return undefined;
};

const getCurrentGameVersion = async (): Promise<string> => {
	const currentVersionRecord = await prisma.gameVersion.findFirst({
		where: { isCurrent: true },
		orderBy: { createdAt: "desc" },
	});

	return currentVersionRecord?.version ?? DEFAULT_DDRAGON_VERSION;
};


export const listChampions = async (filters: ChampionFilters = {}): Promise<ChampionListItem[]> => {
	const search = parseSearchQuery(filters.search);
	const rawTag = parseSearchQuery(filters.tag);
	const tag = rawTag ? normalizeTag(rawTag) : undefined;
	const currentVersion = await getCurrentGameVersion();

	const whereClause = {
		...(search
			? {
			name: {
				contains: search,
				mode: "insensitive" as const,
			},
		}
			: {}),
		...(tag
			? {
				tags: {
					has: tag,
				},
			}
			: {}),
	};

	const champions = await prisma.champion.findMany({
		where: whereClause,
		select: {
			id: true,
			name: true,
			title: true,
			tags: true,
		},
		orderBy: {
			name: "asc",
		},
	});

	return champions.map((champion) => {
		const image = buildChampionLoadingImageUrl(champion.id);
		const avatar = buildChampionAvatarImageUrl(champion.id, currentVersion);
		const splash = buildChampionSplashImageUrl(champion.id);

		return {
			id: champion.id,
			name: champion.name,
			title: champion.title,
			tags: champion.tags,
			image,
			avatar,
			splash,
		};
	});
};
