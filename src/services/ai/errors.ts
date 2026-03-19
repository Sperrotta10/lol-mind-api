export class AIServiceError extends Error {
	readonly code: string;
	readonly details?: unknown;

	constructor(code: string, message: string, details?: unknown) {
		super(message);
		this.name = "AIServiceError";
		this.code = code;
		this.details = details;
	}
}
