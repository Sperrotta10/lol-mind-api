import { GoogleGenAI } from "@google/genai";
import { DEFAULT_MODEL } from "./constants.js";
import { AIServiceError } from "./errors.js";
import { buildResponseSchema } from "./prompt.js";

export const generateGeminiJson = async (apiKey: string, prompt: string): Promise<string> => {
	const client = new GoogleGenAI({ apiKey });
	const response = await client.models.generateContent({
		model: DEFAULT_MODEL,
		contents: prompt,
		config: {
			temperature: 0.3,
			responseMimeType: "application/json",
			responseSchema: buildResponseSchema(),
		},
	});

	const rawText = response.text ?? "";
	if (!rawText.trim()) {
		throw new AIServiceError("AI_EMPTY_RESPONSE", "Gemini devolvio una respuesta vacia");
	}

	return rawText;
};
