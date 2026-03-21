import { prisma } from "../config/db.js";
import { buildVersionImageUrl } from "../utils/ddragonImageUrls.js";

interface VersionListItem {
	id: number;
	version: string;
	isCurrent: boolean;
	createdAt: string;
	image: string;
}

export const listVersions = async (): Promise<VersionListItem[]> => {
	const versions = await prisma.gameVersion.findMany({
		select: {
			id: true,
			version: true,
			isCurrent: true,
			createdAt: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});

	return versions.map((gameVersion) => ({
		id: gameVersion.id,
		version: gameVersion.version,
		isCurrent: gameVersion.isCurrent,
		createdAt: gameVersion.createdAt.toISOString(),
		image: buildVersionImageUrl(gameVersion.version),
	}));
};
