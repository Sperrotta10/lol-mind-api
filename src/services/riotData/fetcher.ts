import { D_DRAGON_BASE_URL, LOCALE, REQUEST_TIMEOUT_MS } from "./constants.js";
import { RiotDataSyncError } from "./errors.js";

const buildCdnUrl = (version: string, file: string): string =>
	`${D_DRAGON_BASE_URL}/cdn/${version}/data/${LOCALE}/${file}`;

export const fetchJson = async <T>(url: string): Promise<T> => {
	const controller = new AbortController();
	const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const response = await fetch(url, {
			method: "GET",
			signal: controller.signal,
			headers: {
				accept: "application/json",
			},
		});

		if (!response.ok) {
			const body = await response.text();
			throw new RiotDataSyncError({
				code: "RIOT_HTTP_ERROR",
				message: `Error en Data Dragon (${response.status})`,
				details: {
					url,
					status: response.status,
					response: body.slice(0, 500),
				},
			});
		}

		return (await response.json()) as T;
	} catch (error) {
		if (error instanceof RiotDataSyncError) {
			throw error;
		}

		if (error instanceof Error && error.name === "AbortError") {
			throw new RiotDataSyncError({
				code: "RIOT_TIMEOUT",
				message: "Tiempo de espera agotado al consultar Data Dragon",
				details: { url, timeoutMs: REQUEST_TIMEOUT_MS },
				cause: error,
			});
		}

		throw new RiotDataSyncError({
			code: "RIOT_FETCH_ERROR",
			message: "No se pudo descargar la respuesta de Data Dragon",
			details: { url },
			cause: error,
		});
	} finally {
		clearTimeout(timeoutId);
	}
};

export const fetchLatestVersion = async (): Promise<string> => {
	const versions = await fetchJson<unknown[]>(`${D_DRAGON_BASE_URL}/api/versions.json`);

	if (!Array.isArray(versions) || versions.length === 0) {
		throw new RiotDataSyncError({
			code: "RIOT_INVALID_VERSIONS",
			message: "Data Dragon devolvio un arreglo de versiones vacio o invalido",
			details: { versions },
		});
	}

	const latestVersion = versions[0];
	if (typeof latestVersion !== "string" || latestVersion.trim().length === 0) {
		throw new RiotDataSyncError({
			code: "RIOT_INVALID_VERSION_VALUE",
			message: "La version mas reciente de Data Dragon es invalida",
			details: { latestVersion },
		});
	}

	return latestVersion;
};

export const fetchChampionPayload = async (version: string): Promise<unknown> =>
	fetchJson<unknown>(buildCdnUrl(version, "champion.json"));

export const fetchItemPayload = async (version: string): Promise<unknown> =>
	fetchJson<unknown>(buildCdnUrl(version, "item.json"));

export const fetchRunePayload = async (version: string): Promise<unknown> =>
	fetchJson<unknown>(buildCdnUrl(version, "runesReforged.json"));
