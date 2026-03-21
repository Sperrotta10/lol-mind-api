import { Type } from "@google/genai";
import type { ChampionContext, ItemContext, RuneContext } from "../types.js";

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
