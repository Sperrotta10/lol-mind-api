import { Type } from "@google/genai";
import { AIServiceError } from "./errors.js";
import type { ChampionContext, ItemContext, RawBaseBuildResponse, RuneContext } from "./types.js";

interface BaseBuildContext {
	champion: ChampionContext;
	itemPool: ItemContext[];
	bootPool: ItemContext[];
	runePool: RuneContext[];
}

export const buildBaseSystemPrompt = (): string => `
Eres un analista experto del meta actual de League of Legends.
Reglas obligatorias:
1) Responde solo en JSON valido, sin markdown ni texto extra.
2) Usa unicamente la informacion de CONTEXT_BLOCK para elegir items y runas.
3) Genera la build estandar/optima para el campeon en contexto sin considerar rival.
4) No inventes items ni runas fuera del contexto.
5) Responde en espanol tecnico claro.
`;

export const buildBaseResponseSchema = () => ({
	type: Type.OBJECT,
	properties: {
		coreItems: { type: Type.ARRAY, items: { type: Type.STRING } },
		situationalItems: { type: Type.ARRAY, items: { type: Type.STRING } },
		boots: { type: Type.STRING },
		runes: {
			type: Type.OBJECT,
			properties: {
				primaryTree: { type: Type.STRING },
				primaryChoices: { type: Type.ARRAY, items: { type: Type.STRING } },
				secondaryTree: { type: Type.STRING },
				secondaryChoices: { type: Type.ARRAY, items: { type: Type.STRING } },
				shards: { type: Type.ARRAY, items: { type: Type.STRING } },
			},
			required: ["primaryTree", "primaryChoices", "secondaryTree", "secondaryChoices", "shards"],
		},
	},
	required: ["coreItems", "situationalItems", "boots", "runes"],
});

export const buildBaseContextBlock = (context: BaseBuildContext): string =>
	[
		"CONTEXT_BLOCK",
		JSON.stringify(context, null, 2),
	].join("\n");

export const buildBaseUserPrompt = (championName: string): string => `
USER_PROMPT
Genera la build base mas optima en el meta actual para ${championName}.
Devuelve Core, Situacional, Botas y Runas.
`;

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
