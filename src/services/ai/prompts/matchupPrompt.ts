import { Type } from "@google/genai";
import type { BuildContext } from "../types.js";

export const buildMatchupSystemPrompt = (): string => `
Eres un analista experto en League of Legends.
Reglas obligatorias:
1) Responde solo en JSON valido, sin markdown ni texto extra.
2) Usa exclusivamente los datos del CONTEXT_BLOCK para fundamentar picks de items y runas.
3) Si no hay datos suficientes, devuelve recomendaciones conservadoras y explicalo en lanePlan.
4) No inventes nombres de items o runas fuera de CONTEXT_BLOCK.
5) El idioma de salida es espanol tecnico claro.
`;

export const buildResponseSchema = () => ({
	type: Type.OBJECT,
	properties: {
		matchup: {
			type: Type.OBJECT,
			properties: {
				allyChampion: { type: Type.STRING },
				enemyChampion: { type: Type.STRING },
				lanePlan: { type: Type.STRING },
				winCondition: { type: Type.STRING },
				riskAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
			},
			required: ["allyChampion", "enemyChampion", "lanePlan", "winCondition", "riskAlerts"],
		},
		build: {
			type: Type.OBJECT,
			properties: {
				startingItems: { type: Type.ARRAY, items: { type: Type.STRING } },
				coreItems: { type: Type.ARRAY, items: { type: Type.STRING } },
				situationalItems: { type: Type.ARRAY, items: { type: Type.STRING } },
				boots: { type: Type.STRING },
			},
			required: ["startingItems", "coreItems", "situationalItems", "boots"],
		},
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
		microPlan: {
			type: Type.OBJECT,
			properties: {
				earlyGame: { type: Type.ARRAY, items: { type: Type.STRING } },
				midGame: { type: Type.ARRAY, items: { type: Type.STRING } },
				lateGame: { type: Type.ARRAY, items: { type: Type.STRING } },
			},
			required: ["earlyGame", "midGame", "lateGame"],
		},
	},
	required: ["matchup", "build", "runes", "microPlan"],
});

export const buildMatchupContextBlock = ({ allyChampion, enemyChampion, items, runes }: BuildContext): string =>
	[
		"CONTEXT_BLOCK",
		JSON.stringify(
			{
				champions: {
					ally: allyChampion,
					enemy: enemyChampion,
				},
				items,
				runes,
			},
			null,
			2,
		),
	].join("\n");

export const buildMatchupUserPrompt = (championName: string, enemyName: string): string => `
USER_PROMPT
Analiza el matchup ${championName} vs ${enemyName} y entrega plan tactico, build y runas.
Prioriza claridad accionable para ranked soloQ.
`;

export const composePrompt = (parts: {
	systemPrompt: string;
	contextBlock: string;
	userPrompt: string;
}): string => [parts.systemPrompt, parts.contextBlock, parts.userPrompt].join("\n\n");
