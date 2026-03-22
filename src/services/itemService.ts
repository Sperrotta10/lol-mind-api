import { prisma } from "../config/db.js";
import { buildItemImageUrl, DEFAULT_DDRAGON_VERSION } from "../utils/ddragonImageUrls.js";

interface ItemListItem {
	id: string;
	name: string;
	description: string;
	plaintext: string | null;
	tags: string[];
	image: string;
}

interface ItemFilters {
	search?: string | string[];
	tag?: string | string[];
}

const parseQueryValue = (value: string | string[] | undefined): string | undefined => {
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

export const listItems = async (filters: ItemFilters = {}): Promise<ItemListItem[]> => {
	const search = parseQueryValue(filters.search);
	const tag = parseQueryValue(filters.tag);
	const currentVersion = await getCurrentGameVersion();

	const items = await prisma.item.findMany({
		where: {
			...(search
				? {
					OR: [
						{ name: { contains: search, mode: "insensitive" } },
						{ id: { contains: search, mode: "insensitive" } },
					],
				}
				: {}),
			...(tag
				? {
					tags: {
						has: tag,
					},
				}
				: {}),
		},
		select: {
			id: true,
			name: true,
			description: true,
			plaintext: true,
			image: true,
			tags: true,
		},
		orderBy: {
			name: "asc",
		},
	});

	return items.map((item) => ({
		id: item.id,
		name: item.name,
		description: item.description,
		plaintext: item.plaintext,
		tags: item.tags,
		image: buildItemImageUrl(item.image, currentVersion),
	}));
};
