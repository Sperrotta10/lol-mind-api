import { prisma } from "../config/db.js";
import { buildRuneIconUrl } from "../utils/ddragonImageUrls.js";

interface RuneListItem {
	id: number;
	key: string;
	name: string;
	shortDesc: string;
	longDesc: string;
	tree: string;
	slot: number;
	image: string;
	treeImage: string;
}

interface RuneFilters {
	search?: string | string[];
	tree?: string | string[];
	slot?: string | string[];
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

const parseSlotValue = (value: string | undefined): number | undefined => {
	if (!value) {
		return undefined;
	}

	const parsed = Number.parseInt(value, 10);
	if (Number.isNaN(parsed)) {
		return undefined;
	}

	return parsed;
};

export const listRunes = async (filters: RuneFilters = {}): Promise<RuneListItem[]> => {
	const search = parseQueryValue(filters.search);
	const tree = parseQueryValue(filters.tree);
	const slot = parseSlotValue(parseQueryValue(filters.slot));

	const runes = await prisma.rune.findMany({
		where: {
			...(search
				? {
					OR: [
						{ name: { contains: search, mode: "insensitive" } },
						{ key: { contains: search, mode: "insensitive" } },
					],
				}
				: {}),
			...(tree
				? {
					tree: {
						equals: tree,
						mode: "insensitive",
					},
				}
				: {}),
			...(slot !== undefined ? { slot } : {}),
		},
		select: {
			id: true,
			key: true,
			name: true,
			shortDesc: true,
			longDesc: true,
			icon: true,
			treeIcon: true,
			tree: true,
			slot: true,
		},
		orderBy: [{ tree: "asc" }, { slot: "asc" }, { name: "asc" }],
	});

	return runes.map((rune) => ({
		id: rune.id,
		key: rune.key,
		name: rune.name,
		shortDesc: rune.shortDesc,
		longDesc: rune.longDesc,
		tree: rune.tree,
		slot: rune.slot,
		image: buildRuneIconUrl(rune.icon),
		treeImage: buildRuneIconUrl(rune.treeIcon),
	}));
};
