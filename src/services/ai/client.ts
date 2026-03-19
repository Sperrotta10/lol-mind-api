import { GoogleGenAI } from "@google/genai";
import { DEFAULT_MODEL } from "./constants.js";
import { AIServiceError } from "./errors.js";
import { buildResponseSchema } from "./prompt.js";

interface GenerateGeminiJsonOptions {
	responseSchema: unknown;
	temperature?: number;
	model?: string;
}

export const generateGeminiJsonWithSchema = async (
	apiKey: string,
	prompt: string,
	options: GenerateGeminiJsonOptions,
): Promise<string> => {
	const {
		responseSchema,
		temperature = 0.3,
		model = DEFAULT_MODEL,
	} = options;

	const client = new GoogleGenAI({ apiKey });
	const response = await client.models.generateContent({
		model,
		contents: prompt,
		config: {
			temperature,
			responseMimeType: "application/json",
			responseSchema,
		},
	});

	const rawText = response.text ?? "";
	if (!rawText.trim()) {
		throw new AIServiceError("AI_EMPTY_RESPONSE", "Gemini devolvio una respuesta vacia");
	}

	return rawText;
};

export const generateGeminiJson = async (apiKey: string, prompt: string): Promise<string> =>
	generateGeminiJsonWithSchema(apiKey, prompt, {
		responseSchema: buildResponseSchema(),
	});
