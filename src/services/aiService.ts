import { generateGeminiJson } from "./ai/client.js";
import { findChampionByName, getItemContext, getRuneContext } from "./ai/context.js";
import { AIServiceError } from "./ai/errors.js";
import { parseMatchupResponse } from "./ai/parser.js";
import {
	buildContextBlock,
	buildSystemPrompt,
	buildUserPrompt,
	composePrompt,
} from "./ai/prompt.js";
import type { MatchupBuildResponse } from "./ai/types.js";
import { env } from "../config/env.js";
export { AIServiceError };
export type { MatchupBuildResponse };

export const generateBuild = async (
	championName: string,
	enemyName: string,
): Promise<MatchupBuildResponse> => {
	if (!env.GEMINI_API_KEY) {
		throw new AIServiceError("AI_MISSING_API_KEY", "Falta GEMINI_API_KEY en variables de entorno");
	}

	if (!championName.trim() || !enemyName.trim()) {
		throw new AIServiceError("AI_INVALID_INPUT", "championName y enemyName son obligatorios");
	}

	const [allyChampion, enemyChampion, items, runes] = await Promise.all([
		findChampionByName(championName),
		findChampionByName(enemyName),
		getItemContext(),
		getRuneContext(),
	]);

	if (!allyChampion || !enemyChampion) {
		throw new AIServiceError(
			"AI_CHAMPION_NOT_FOUND",
			"No se encontro uno o ambos campeones en la base de datos",
			{
				championName,
				enemyName,
				allyFound: Boolean(allyChampion),
				enemyFound: Boolean(enemyChampion),
			},
		);
	}

	const systemPrompt = buildSystemPrompt();
	const contextBlock = buildContextBlock({
		allyChampion,
		enemyChampion,
		items,
		runes,
	});
	const userPrompt = buildUserPrompt(allyChampion.name, enemyChampion.name);

	const composedPrompt = composePrompt({ systemPrompt, contextBlock, userPrompt });
	const rawText = await generateGeminiJson(env.GEMINI_API_KEY, composedPrompt);
	return parseMatchupResponse(rawText);
};
