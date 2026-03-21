import { AIServiceError } from "../errors.js";

export const extractJsonText = (rawText: string): string => {
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
