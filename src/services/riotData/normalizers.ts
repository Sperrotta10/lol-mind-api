import { RiotDataSyncError } from "./errors.js";
import { asNumber, asString, asStringArray, isObject } from "./parsers.js";
import type { NormalizedChampion, NormalizedItem, NormalizedRune } from "./types.js";
import type { Prisma } from "../../generated/prisma/index.js";

const asInputJson = (value: unknown, fallback: Prisma.InputJsonValue): Prisma.InputJsonValue =>
	isObject(value) ? (value as unknown as Prisma.InputJsonValue) : fallback;

export const normalizeChampionRecords = (payload: unknown): NormalizedChampion[] => {
	if (!isObject(payload) || !isObject(payload.data)) {
		throw new RiotDataSyncError({
			code: "RIOT_INVALID_CHAMPIONS",
			message: "Formato invalido en champion.json",
			details: payload,
		});
	}

	const data = payload.data as Record<string, unknown>;
	const champions: NormalizedChampion[] = [];

	for (const value of Object.values(data)) {
		if (!isObject(value)) {
			continue;
		}

		const id = asString(value.id);
		const key = asNumber(value.key);
		const name = asString(value.name);
		const title = asString(value.title);

		if (!id || key === null || !name || !title) {
			continue;
		}

		champions.push({
			id,
			key,
			name,
			title,
			avatar: `${id}.png`,
			loading: `${id}_0.jpg`,
			splash: `${id}_0.jpg`,
			tags: asStringArray(value.tags),
			stats: asInputJson(value.stats, {}),
		});
	}

	return champions;
};

export const normalizeItemRecords = (payload: unknown): NormalizedItem[] => {
	if (!isObject(payload) || !isObject(payload.data)) {
		throw new RiotDataSyncError({
			code: "RIOT_INVALID_ITEMS",
			message: "Formato invalido en item.json",
			details: payload,
		});
	}

	const data = payload.data as Record<string, unknown>;
	const items: NormalizedItem[] = [];

	for (const [id, value] of Object.entries(data)) {
		if (!isObject(value)) {
			continue;
		}

		const name = asString(value.name);
		const description = asString(value.description);
		if (!name || !description) {
			continue;
		}

		items.push({
			id,
			name,
			description,
			plaintext: asString(value.plaintext),
			image: `${id}.png`,
			gold: asInputJson(value.gold, {}),
			stats: isObject(value.stats) ? asInputJson(value.stats, {}) : null,
			tags: asStringArray(value.tags),
		});
	}

	return items;
};

export const normalizeRuneRecords = (payload: unknown): NormalizedRune[] => {
	if (!Array.isArray(payload)) {
		throw new RiotDataSyncError({
			code: "RIOT_INVALID_RUNES",
			message: "Formato invalido en runesReforged.json",
			details: payload,
		});
	}

	const runes: NormalizedRune[] = [];

	for (const treeNode of payload) {
		if (!isObject(treeNode)) {
			continue;
		}

		const treeKey = asString(treeNode.key);
		const treeIcon = asString(treeNode.icon);
		const slots = treeNode.slots;
		if (!treeKey || !treeIcon || !Array.isArray(slots)) {
			continue;
		}

		slots.forEach((slotNode, slotIndex) => {
			if (!isObject(slotNode) || !Array.isArray(slotNode.runes)) {
				return;
			}

			slotNode.runes.forEach((runeNode) => {
				if (!isObject(runeNode)) {
					return;
				}

				const id = asNumber(runeNode.id);
				const key = asString(runeNode.key);
				const name = asString(runeNode.name);
				const shortDesc = asString(runeNode.shortDesc);
				const longDesc = asString(runeNode.longDesc);
				const icon = asString(runeNode.icon);

				if (id === null || !key || !name || !shortDesc || !longDesc || !icon) {
					return;
				}

				runes.push({
					id,
					key,
					name,
					shortDesc,
					longDesc,
						icon,
						treeIcon,
					tree: treeKey,
					slot: slotIndex,
				});
			});
		});
	}

	return runes;
};
