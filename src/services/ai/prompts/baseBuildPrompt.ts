import { Type } from "@google/genai";
import type { ChampionContext, ItemContext, RuneContext } from "../types.js";

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
6) IMPORTANTE: Tu respuesta debe contener EXCLUSIVAMENTE los IDs de los items (ej. "3026") y los IDs o Keys de las runas (ej. 8010 o "Conqueror"), NUNCA los nombres. No inventes IDs que no existan en el CONTEXT_BLOCK.
`;

export const buildBaseResponseSchema = () => ({
	type: Type.OBJECT,
	properties: {
		coreItems: {
			type: Type.ARRAY,
			description: "Array de IDs exactos de los items extraidos del CONTEXT_BLOCK. No usar nombres.",
			items: { type: Type.STRING },
		},
		situationalItems: {
			type: Type.ARRAY,
			description: "Array de IDs exactos de items situacionales del CONTEXT_BLOCK. No usar nombres.",
			items: { type: Type.STRING },
		},
		boots: {
			type: Type.STRING,
			description: "ID exacto de las botas seleccionado desde CONTEXT_BLOCK. No usar nombre.",
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
