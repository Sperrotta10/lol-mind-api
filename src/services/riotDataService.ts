import {
	fetchChampionPayload,
	fetchItemPayload,
	fetchLatestVersion,
	fetchRunePayload,
} from "./riotData/fetcher.js";
import { RiotDataSyncError } from "./riotData/errors.js";
import {
	normalizeChampionRecords,
	normalizeItemRecords,
	normalizeRuneRecords,
} from "./riotData/normalizers.js";
import {
	setCurrentVersion,
	upsertChampions,
	upsertItems,
	upsertRunes,
} from "./riotData/persistence.js";
import type { SyncRiotDataSummary } from "./riotData/types.js";

export { RiotDataSyncError };
export type { SyncRiotDataSummary };

export const syncRiotData = async (): Promise<SyncRiotDataSummary> => {
	try {
		const latestVersion = await fetchLatestVersion();

		const championsPayload = await fetchChampionPayload(latestVersion);
		const itemsPayload = await fetchItemPayload(latestVersion);
		const runesPayload = await fetchRunePayload(latestVersion);

		const champions = normalizeChampionRecords(championsPayload);
		const items = normalizeItemRecords(itemsPayload);
		const runes = normalizeRuneRecords(runesPayload);

		await setCurrentVersion(latestVersion);
		await upsertChampions(champions);
		await upsertItems(items);
		await upsertRunes(runes);

		return {
			version: latestVersion,
			championsSynced: champions.length,
			itemsSynced: items.length,
			runesSynced: runes.length,
		};
	} catch (error) {
		if (error instanceof RiotDataSyncError) {
			throw error;
		}

		throw new RiotDataSyncError({
			code: "RIOT_SYNC_UNEXPECTED_ERROR",
			message: "Error inesperado durante la sincronizacion de Data Dragon",
			cause: error,
		});
	}
};
