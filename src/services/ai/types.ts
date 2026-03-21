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

export interface BuildItemReference {
	id: string | null;
	name: string;
	image: string | null;
}

export interface BuildRuneReference {
	id: number | null;
	key: string | null;
	name: string;
	tree: string | null;
	image: string | null;
	treeImage: string | null;
}

export interface RuneTreeReference {
	name: string;
	image: string | null;
}

export interface RawMatchupBuildResponse {
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

export interface MatchupBuildResponse {
	matchup: {
		allyChampion: string;
		enemyChampion: string;
		lanePlan: string;
		winCondition: string;
		riskAlerts: string[];
	};
	build: {
		startingItems: BuildItemReference[];
		coreItems: BuildItemReference[];
		situationalItems: BuildItemReference[];
		boots: BuildItemReference;
	};
	runes: {
		primaryTree: RuneTreeReference;
		primaryChoices: BuildRuneReference[];
		secondaryTree: RuneTreeReference;
		secondaryChoices: BuildRuneReference[];
		shards: string[];
	};
	microPlan: {
		earlyGame: string[];
		midGame: string[];
		lateGame: string[];
	};
}

export interface RawStyleBuildResponse {
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

export interface StyleBuildResponse {
	coreItems: BuildItemReference[];
	situationalItems: BuildItemReference[];
	runes: {
		primaryTree: RuneTreeReference;
		primaryChoices: BuildRuneReference[];
		secondaryTree: RuneTreeReference;
		secondaryChoices: BuildRuneReference[];
		shards: string[];
	};
	playstyleExplanation: string;
}

export interface RawTeamCompAnalysisResponse {
	composition: {
		myTeamDamageProfile: string;
		enemyTeamDamageProfile: string;
		ccAdvantage: string;
		globalWinCondition: string;
	};
	recommendedBuild: {
		coreItems: string[];
		situationalItems: string[];
		boots: string;
	};
	explanation: string;
}

export interface TeamCompAnalysisResponse {
	composition: {
		myTeamDamageProfile: string;
		enemyTeamDamageProfile: string;
		ccAdvantage: string;
		globalWinCondition: string;
	};
	recommendedBuild: {
		coreItems: BuildItemReference[];
		situationalItems: BuildItemReference[];
		boots: BuildItemReference;
	};
	explanation: string;
}

export interface RawBaseBuildResponse {
	coreItems: string[];
	situationalItems: string[];
	boots: string;
	runes: {
		primaryTree: string;
		primaryChoices: string[];
		secondaryTree: string;
		secondaryChoices: string[];
		shards: string[];
	};
}

export interface BaseBuildResponse {
	coreItems: BuildItemReference[];
	situationalItems: BuildItemReference[];
	boots: BuildItemReference;
	runes: {
		primaryTree: RuneTreeReference;
		primaryChoices: BuildRuneReference[];
		secondaryTree: RuneTreeReference;
		secondaryChoices: BuildRuneReference[];
		shards: string[];
	};
}

export interface BuildContext {
	allyChampion: ChampionContext;
	enemyChampion: ChampionContext;
	items: ItemContext[];
	runes: RuneContext[];
}
