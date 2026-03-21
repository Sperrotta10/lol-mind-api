import { AIServiceError } from "../errors.js";
import type { RawStyleBuildResponse } from "../types.js";
import { extractJsonText } from "./jsonPayloadParser.js";

export const parseStyleBuildResponse = (rawText: string): RawStyleBuildResponse => {
	try {
		const jsonText = extractJsonText(rawText);
		return JSON.parse(jsonText) as RawStyleBuildResponse;
	} catch (error) {
		throw new AIServiceError("AI_PARSE_ERROR", "No se pudo parsear el JSON de build por estilo", {
			rawText,
			cause: error,
		});
	}
};
