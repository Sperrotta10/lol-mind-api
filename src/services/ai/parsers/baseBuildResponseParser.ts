import { AIServiceError } from "../errors.js";
import type { RawBaseBuildResponse } from "../types.js";
import { extractJsonText } from "./jsonPayloadParser.js";

export const parseBaseBuildResponse = (rawText: string): RawBaseBuildResponse => {
	try {
		const jsonText = extractJsonText(rawText);
		return JSON.parse(jsonText) as RawBaseBuildResponse;
	} catch (error) {
		throw new AIServiceError("AI_PARSE_ERROR", "No se pudo parsear el JSON de build base", {
			rawText,
			cause: error,
		});
	}
};
