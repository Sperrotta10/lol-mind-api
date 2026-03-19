import { prisma } from "../../config/db.js";
import { MAX_ITEMS_FOR_CONTEXT, MAX_RUNES_FOR_CONTEXT } from "./constants.js";
import type { ChampionContext, ItemContext, RuneContext } from "./types.js";

const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

interface ItemContextOptions {
	minGoldTotal?: number;
	maxItems?: number;
	excludeBootsAndConsumables?: boolean;
}

const sanitizeText = (value: string): string => value.trim();

export const findChampionByName = async (championName: string): Promise<ChampionContext | null> => {
	const cleanedName = sanitizeText(championName);

	const champion = await prisma.champion.findFirst({
		where: {
			OR: [
				{ name: { equals: cleanedName, mode: "insensitive" } },
				{ id: { equals: cleanedName, mode: "insensitive" } },
			],
		},
		select: {
			id: true,
			key: true,
			name: true,
			title: true,
			tags: true,
			stats: true,
		},
	});

	if (!champion) {
		return null;
	}

	return {
		id: champion.id,
		key: champion.key,
		name: champion.name,
		title: champion.title,
		tags: champion.tags,
		stats: isObject(champion.stats) ? champion.stats : {},
	};
};

const isBootOrConsumable = (tags: string[]): boolean => {
	const blockedTags = new Set(["Boots", "Consumable", "Trinket"]);
	return tags.some((tag) => blockedTags.has(tag));
};

const parseGoldTotal = (gold: unknown): number | null => {
	if (!isObject(gold)) {
		return null;
	}

	const totalValue = gold.total;
	if (typeof totalValue === "number" && Number.isFinite(totalValue)) {
		return totalValue;
	}

	if (typeof totalValue === "string") {
		const parsed = Number.parseInt(totalValue, 10);
		return Number.isFinite(parsed) ? parsed : null;
	}

	return null;
};

export const getItemContext = async (options: ItemContextOptions = {}): Promise<ItemContext[]> => {
	const {
		minGoldTotal = 2200,
		maxItems = MAX_ITEMS_FOR_CONTEXT,
		excludeBootsAndConsumables = true,
	} = options;

	const items = await prisma.item.findMany({
		select: {
			id: true,
			name: true,
			plaintext: true,
			tags: true,
			gold: true,
		},
	});

	const filteredItems = items
		.map((item) => ({
			id: item.id,
			name: item.name,
			plaintext: item.plaintext,
			tags: item.tags,
			goldTotal: parseGoldTotal(item.gold),
		}))
		.filter((item) => (excludeBootsAndConsumables ? !isBootOrConsumable(item.tags) : true))
		.filter((item) => (item.goldTotal ?? 0) >= minGoldTotal)
		.sort((a, b) => (b.goldTotal ?? 0) - (a.goldTotal ?? 0));

	return filteredItems.slice(0, maxItems);
};

export const getRuneContext = async (): Promise<RuneContext[]> => {
	const runes = await prisma.rune.findMany({
		select: {
			id: true,
			key: true,
			name: true,
			tree: true,
			slot: true,
			shortDesc: true,
		},
		orderBy: [{ tree: "asc" }, { slot: "asc" }],
	});

	return runes.slice(0, MAX_RUNES_FOR_CONTEXT);
};
