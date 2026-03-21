import { AIServiceError } from "./errors.js";
import type { RawMatchupBuildResponse } from "./types.js";

const extractJsonText = (rawText: string): string => {
	const trimmed = rawText.trim();
	if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
		return trimmed;
	}

	const jsonStart = trimmed.indexOf("{");
	const jsonEnd = trimmed.lastIndexOf("}");
	if (jsonStart >= 0 && jsonEnd > jsonStart) {
		return trimmed.slice(jsonStart, jsonEnd + 1);
	}

	throw new AIServiceError("AI_INVALID_JSON", "La respuesta de Gemini no contiene JSON valido");
};

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
