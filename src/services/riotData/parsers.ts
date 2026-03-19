export const isObject = (value: unknown): value is Record<string, unknown> =>
	typeof value === "object" && value !== null;

export const asString = (value: unknown): string | null =>
	typeof value === "string" && value.trim().length > 0 ? value : null;

export const asNumber = (value: unknown): number | null => {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string") {
		const parsed = Number.parseInt(value, 10);
		return Number.isFinite(parsed) ? parsed : null;
	}

	return null;
};

export const asStringArray = (value: unknown): string[] => {
	if (!Array.isArray(value)) {
		return [];
	}

	return value.filter((entry): entry is string => typeof entry === "string");
};
