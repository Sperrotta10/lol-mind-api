import { AIServiceError } from "../errors.js";
import type { RawMatchupBuildResponse } from "../types.js";
import { extractJsonText } from "./jsonPayloadParser.js";

export const parseMatchupResponse = (rawText: string): RawMatchupBuildResponse => {
	try {
		const jsonText = extractJsonText(rawText);
		return JSON.parse(jsonText) as RawMatchupBuildResponse;
	} catch (error) {
		throw new AIServiceError("AI_PARSE_ERROR", "No se pudo parsear el JSON devuelto por Gemini", {
			rawText,
			cause: error,
		});
	}
};
