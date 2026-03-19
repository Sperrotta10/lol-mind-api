export interface ChampionContext {
	id: string;
	key: number;
	name: string;
	title: string;
	tags: string[];
	stats: Record<string, unknown>;
}

export interface ItemContext {
	id: string;
	name: string;
	plaintext: string | null;
	tags: string[];
	goldTotal: number | null;
}

export interface RuneContext {
	id: number;
	key: string;
	name: string;
	tree: string;
	slot: number;
	shortDesc: string;
}

export interface MatchupBuildResponse {
	matchup: {
		allyChampion: string;
		enemyChampion: string;
		lanePlan: string;
		winCondition: string;
		riskAlerts: string[];
	};
	build: {
		startingItems: string[];
		coreItems: string[];
		situationalItems: string[];
		boots: string;
	};
	runes: {
		primaryTree: string;
		primaryChoices: string[];
		secondaryTree: string;
		secondaryChoices: string[];
		shards: string[];
	};
	microPlan: {
		earlyGame: string[];
		midGame: string[];
		lateGame: string[];
	};
}

export interface StyleBuildResponse {
	coreItems: string[];
	situationalItems: string[];
	runes: {
		primaryTree: string;
		primaryChoices: string[];
		secondaryTree: string;
		secondaryChoices: string[];
		shards: string[];
	};
	playstyleExplanation: string;
}

export interface BuildContext {
	allyChampion: ChampionContext;
	enemyChampion: ChampionContext;
	items: ItemContext[];
	runes: RuneContext[];
}
