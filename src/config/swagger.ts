import type { Express, Request, Response } from "express";
import swaggerJSDoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import { env } from "./env.js";

const swaggerDefinition: swaggerJSDoc.OAS3Definition = {
	openapi: "3.0.0",
	info: {
		title: "LOL Mind API",
		version: "1.0.0",
		description:
			"API para analisis de composiciones, matchups y builds de League of Legends con IA + RAG.",
	},
	servers: [
		{
			url: "http://localhost:3000",
			description: "Local",
		},
        {
            url: env.BACKEND_URL || "http://localhost:3000",
            description: "Producción",
        }
	],
	tags: [
		{ name: "Health" },
		{ name: "Riot" },
		{ name: "Champions" },
		{ name: "Items" },
		{ name: "Runes" },
		{ name: "Versions" },
		{ name: "Builds" },
		{ name: "Cron" },
	],
	components: {
		securitySchemes: {
			bearerAuth: {
				type: "http",
				scheme: "bearer",
				bearerFormat: "JWT",
			},
		},
		schemas: {
			ErrorResponse: {
				type: "object",
				properties: {
					success: {
						type: "boolean",
						example: false,
					},
					error: {
						type: "object",
						properties: {
							code: { type: "string", example: "INTERNAL_SERVER_ERROR" },
							message: { type: "string", example: "Unexpected error" },
							details: {
								nullable: true,
								oneOf: [{ type: "array", items: { type: "string" } }, { type: "object" }],
							},
						},
					},
					meta: {
						type: "object",
						properties: {
							requestId: { type: "string", example: "b7837f95-4c2d-42f2-bff7-a6f5dbcc8f9e" },
						},
					},
				},
			},
		},
	},
};

const options: swaggerJSDoc.Options = {
	definition: swaggerDefinition,
	apis: ["src/index.ts", "src/routes/*.ts"],
};

const specs = swaggerJSDoc(options);

export const setupSwagger = (app: Express): void => {
	app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(specs, { explorer: true }));

	app.get("/api/docs.json", (_req: Request, res: Response) => {
		res.status(200).json(specs);
	});
};
