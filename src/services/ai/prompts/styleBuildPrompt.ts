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
6) IMPORTANTE: Tu respuesta debe contener EXCLUSIVAMENTE los IDs de los items (ej. "3026") y los IDs o Keys de las runas (ej. 8010 o "Conqueror"), NUNCA los nombres. No inventes IDs que no existan en el CONTEXT_BLOCK.
`;

export const buildStyleResponseSchema = () => ({
	type: Type.OBJECT,
	properties: {
		coreItems: {
			type: Type.ARRAY,
			description: "Array de IDs exactos de items core extraidos del CONTEXT_BLOCK. No usar nombres.",
			items: { type: Type.STRING },
		},
		situationalItems: {
			type: Type.ARRAY,
			description: "Array de IDs exactos de items situacionales extraidos del CONTEXT_BLOCK. No usar nombres.",
			items: { type: Type.STRING },
		},
		runes: {
			type: Type.OBJECT,
			properties: {
				primaryTree: {
					type: Type.STRING,
					description: "Nombre exacto del arbol primario de runas segun CONTEXT_BLOCK.",
				},
				primaryChoices: {
					type: Type.ARRAY,
					description: "Array de IDs numericos o Keys exactas de runas primarias desde CONTEXT_BLOCK. No usar nombres.",
					items: { type: Type.STRING },
				},
				secondaryTree: {
					type: Type.STRING,
					description: "Nombre exacto del arbol secundario de runas segun CONTEXT_BLOCK.",
				},
				secondaryChoices: {
					type: Type.ARRAY,
					description: "Array de IDs numericos o Keys exactas de runas secundarias desde CONTEXT_BLOCK. No usar nombres.",
					items: { type: Type.STRING },
				},
				shards: {
					type: Type.ARRAY,
					description: "Shards de runas usando IDs o valores exactos provistos por CONTEXT_BLOCK.",
					items: { type: Type.STRING },
				},
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
