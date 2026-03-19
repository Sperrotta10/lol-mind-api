import { Prisma } from "../../generated/prisma/index.js";
import { prisma } from "../../config/db.js";
import { UPSERT_BATCH_SIZE } from "./constants.js";
import type { NormalizedChampion, NormalizedItem, NormalizedRune } from "./types.js";

const processInBatches = async <T>(
	items: T[],
	batchSize: number,
	worker: (item: T) => Promise<void>,
): Promise<void> => {
	for (let i = 0; i < items.length; i += batchSize) {
		const batch = items.slice(i, i + batchSize);
		await Promise.all(batch.map((item) => worker(item)));
	}
};

export const setCurrentVersion = async (version: string): Promise<void> => {
	await prisma.$transaction([
		prisma.gameVersion.updateMany({ data: { isCurrent: false } }),
		prisma.gameVersion.upsert({
			where: { version },
			create: { version, isCurrent: true },
			update: { isCurrent: true },
		}),
	]);
};

export const upsertChampions = async (champions: NormalizedChampion[]): Promise<void> => {
	await processInBatches(champions, UPSERT_BATCH_SIZE, async (champion) => {
		await prisma.champion.upsert({
			where: { id: champion.id },
			create: {
				id: champion.id,
				key: champion.key,
				name: champion.name,
				title: champion.title,
				tags: champion.tags,
				stats: champion.stats,
			},
			update: {
				key: champion.key,
				name: champion.name,
				title: champion.title,
				tags: champion.tags,
				stats: champion.stats,
			},
		});
	});
};

export const upsertItems = async (items: NormalizedItem[]): Promise<void> => {
	await processInBatches(items, UPSERT_BATCH_SIZE, async (item) => {
		await prisma.item.upsert({
			where: { id: item.id },
			create: {
				id: item.id,
				name: item.name,
				description: item.description,
				plaintext: item.plaintext,
				gold: item.gold,
				stats: item.stats ?? Prisma.JsonNull,
				tags: item.tags,
			},
			update: {
				name: item.name,
				description: item.description,
				plaintext: item.plaintext,
				gold: item.gold,
				stats: item.stats ?? Prisma.JsonNull,
				tags: item.tags,
			},
		});
	});
};

export const upsertRunes = async (runes: NormalizedRune[]): Promise<void> => {
	await processInBatches(runes, UPSERT_BATCH_SIZE, async (rune) => {
		await prisma.rune.upsert({
			where: { id: rune.id },
			create: {
				id: rune.id,
				key: rune.key,
				name: rune.name,
				shortDesc: rune.shortDesc,
				longDesc: rune.longDesc,
				tree: rune.tree,
				slot: rune.slot,
			},
			update: {
				key: rune.key,
				name: rune.name,
				shortDesc: rune.shortDesc,
				longDesc: rune.longDesc,
				tree: rune.tree,
				slot: rune.slot,
			},
		});
	});
};
