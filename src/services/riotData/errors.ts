import type { RiotServiceErrorData } from "./types.js";

export class RiotDataSyncError extends Error {
	readonly code: string;
	readonly details?: unknown;
	readonly cause?: unknown;

	constructor({ code, message, details, cause }: RiotServiceErrorData) {
		super(message);
		this.name = "RiotDataSyncError";
		this.code = code;
		this.details = details;
		this.cause = cause;
	}
}
