import type { Prisma } from "../../generated/prisma/index.js";

export interface RiotServiceErrorData {
	code: string;
	message: string;
	details?: unknown;
	cause?: unknown;
}

export interface SyncRiotDataSummary {
	version: string;
	championsSynced: number;
	itemsSynced: number;
	runesSynced: number;
}

export interface NormalizedChampion {
	id: string;
	key: number;
	name: string;
	title: string;
	avatar: string;
	loading: string;
	splash: string;
	tags: string[];
	stats: Prisma.InputJsonValue;
}

export interface NormalizedItem {
	id: string;
	name: string;
	description: string;
	plaintext: string | null;
	image: string;
	gold: Prisma.InputJsonValue;
	stats: Prisma.InputJsonValue | null;
	tags: string[];
}

export interface NormalizedRune {
	id: number;
	key: string;
	name: string;
	shortDesc: string;
	longDesc: string;
	icon: string;
	treeIcon: string;
	tree: string;
	slot: number;
}
