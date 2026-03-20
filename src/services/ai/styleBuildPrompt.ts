import { Type } from "@google/genai";
import { AIServiceError } from "./errors.js";
import type { ChampionContext, ItemContext, RuneContext, StyleBuildResponse } from "./types.js";

interface StyleBuildContext {
	champion: ChampionContext;
	style: string;
	items: ItemContext[];
	runes: RuneContext[];
}

export const buildStyleSystemPrompt = (): string => `
Eres un theorycrafter experto de League of Legends.
Reglas obligatorias:
1) Responde solo en JSON valido, sin markdown ni texto extra.
2) Usa solamente los datos del CONTEXT_BLOCK para seleccionar items y runas.
3) Enfocate EXCLUSIVAMENTE en el estilo solicitado por el usuario.
4) No inventes nombres de items o runas que no esten en el contexto.
5) El texto debe estar en espanol tecnico claro.
`;

export const buildStyleResponseSchema = () => ({
	type: Type.OBJECT,
	properties: {
		coreItems: { type: Type.ARRAY, items: { type: Type.STRING } },
		situationalItems: { type: Type.ARRAY, items: { type: Type.STRING } },
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
		playstyleExplanation: { type: Type.STRING },
	},
	required: ["coreItems", "situationalItems", "runes", "playstyleExplanation"],
});

export const buildStyleContextBlock = ({ champion, style, items, runes }: StyleBuildContext): string =>
	[
		"CONTEXT_BLOCK",
		JSON.stringify(
			{
				champion,
				style,
				itemPool: items,
				runePool: runes,
			},
			null,
			2,
		),
	].join("\n");

export const buildStyleUserPrompt = (championName: string, style: string): string => `
USER_PROMPT
Genera una build theorycrafting para ${championName} enfocada EXCLUSIVAMENTE en el estilo: ${style}.
Devuelve coreItems, situationalItems, runes y playstyleExplanation.
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

export const parseStyleBuildResponse = (rawText: string): StyleBuildResponse => {
	try {
		const jsonText = extractJsonText(rawText);
		return JSON.parse(jsonText) as StyleBuildResponse;
	} catch (error) {
		throw new AIServiceError("AI_PARSE_ERROR", "No se pudo parsear el JSON de build por estilo", {
			rawText,
			cause: error,
		});
	}
};
