import { AIServiceError } from "../errors.js";
import type { RawTeamCompAnalysisResponse } from "../types.js";
import { extractJsonText } from "./jsonPayloadParser.js";

export const parseTeamCompResponse = (rawText: string): RawTeamCompAnalysisResponse => {
	try {
		const jsonText = extractJsonText(rawText);
		return JSON.parse(jsonText) as RawTeamCompAnalysisResponse;
	} catch (error) {
		throw new AIServiceError("AI_PARSE_ERROR", "No se pudo parsear el JSON de analisis 5v5", {
			rawText,
			cause: error,
		});
	}
};
