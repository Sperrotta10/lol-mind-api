import { Type } from "@google/genai";
import type { ChampionContext, ItemContext } from "../types.js";

interface TeamCompContext {
	myTeam: ChampionContext[];
	enemyTeam: ChampionContext[];
	myChampion: ChampionContext;
	itemPool: ItemContext[];
	bootPool: ItemContext[];
}

export const buildTeamCompSystemPrompt = (): string => `
Eres un analista avanzado de composiciones 5v5 en League of Legends.
Reglas obligatorias:
1) Responde solo en JSON valido, sin markdown ni texto extra.
2) Usa SOLO los datos dentro de CONTEXT_BLOCK.
3) Analiza: perfil de dano predominante por equipo, ventaja de control de masas y win condition global.
4) Recomienda build para myChampion orientada a compensar debilidades de myTeam o contrarrestar enemyTeam.
5) No inventes items fuera de itemPool/bootPool.
6) Responde en espanol tecnico claro.
7) IMPORTANTE: Tu respuesta debe contener EXCLUSIVAMENTE los IDs de los items (ej. "3026") y los IDs o Keys de las runas cuando aplique (ej. 8010 o "Conqueror"), NUNCA los nombres. No inventes IDs que no existan en el CONTEXT_BLOCK.
`;

export const buildTeamCompResponseSchema = () => ({
	type: Type.OBJECT,
	properties: {
		composition: {
			type: Type.OBJECT,
			properties: {
				myTeamDamageProfile: { type: Type.STRING },
				enemyTeamDamageProfile: { type: Type.STRING },
				ccAdvantage: { type: Type.STRING },
				globalWinCondition: { type: Type.STRING },
			},
			required: ["myTeamDamageProfile", "enemyTeamDamageProfile", "ccAdvantage", "globalWinCondition"],
		},
		recommendedBuild: {
			type: Type.OBJECT,
			properties: {
				coreItems: {
					type: Type.ARRAY,
					description: "Array de IDs exactos de items core desde CONTEXT_BLOCK. No usar nombres.",
					items: { type: Type.STRING },
				},
				situationalItems: {
					type: Type.ARRAY,
					description: "Array de IDs exactos de items situacionales desde CONTEXT_BLOCK. No usar nombres.",
					items: { type: Type.STRING },
				},
				boots: {
					type: Type.STRING,
					description: "ID exacto de botas seleccionado desde CONTEXT_BLOCK. No usar nombre.",
				},
			},
			required: ["coreItems", "situationalItems", "boots"],
		},
		explanation: { type: Type.STRING },
	},
	required: ["composition", "recommendedBuild", "explanation"],
});

export const buildTeamCompContextBlock = (context: TeamCompContext): string =>
	[
		"CONTEXT_BLOCK",
		JSON.stringify(context, null, 2),
	].join("\n");

export const buildTeamCompUserPrompt = (): string => `
USER_PROMPT
Analiza la composicion 5v5 y responde:
1) Tipo de dano predominante por equipo.
2) Quien tiene mejor control de masas (CC).
3) Cual es la win condition global.
4) Build recomendada para myChampion con core, situacional y botas.
`;
