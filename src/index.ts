import { randomUUID } from "node:crypto";
import { env } from "./config/env.js";
import { disconnectDatabase } from "./config/db.js";
import { setupSwagger } from "./config/swagger.js";
import cors, { type CorsOptions } from "cors";
import morgan from "morgan";
import express, {
	type NextFunction,
	type Request,
	type Response,
} from "express";
import cronRoutes from "./routes/cronRoutes.js";
import { router } from "./routes/index.js";

interface ErrorWithStatus extends Error {
	statusCode?: number;
	code?: string;
	details?: unknown;
}

const app = express();
const port = env.PORT;
const isProduction = env.NODE_ENV === "production";

const allowedOrigins = env.CORS_ORIGIN
	? env.CORS_ORIGIN.split(",")
			.map((origin) => origin.trim())
			.filter((origin) => origin.length > 0)
	: [];

const corsOptions: CorsOptions = {
	origin(origin, callback) {
		if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
			callback(null, true);
			return;
		}

		callback(new Error("Origin not allowed by CORS"));
	},
	credentials: true,
};

app.disable("x-powered-by");
app.use(morgan("combined"));
app.use((req, res, next) => {
	const requestId = req.header("x-request-id") ?? randomUUID();
	res.locals.requestId = requestId;
	res.setHeader("x-request-id", requestId);
	next();
});

app.use(cors(corsOptions));
app.use(express.json({ limit: "1mb" }));
setupSwagger(app);
app.use("/api", router);
app.use("/api/admin", cronRoutes);

/**
 * @openapi
 * /health:
 *   get:
 *     summary: Verifica estado de la API
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API activa
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                     service:
 *                       type: string
 *                     uptime:
 *                       type: number
 *                     timestamp:
 *                       type: string
 *                       format: date-time
 *                 meta:
 *                   type: object
 *                   properties:
 *                     requestId:
 *                       type: string
 */
app.get("/health", (_req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		data: {
			status: "ok",
			service: "lol-mind-api",
			uptime: process.uptime(),
			timestamp: new Date().toISOString(),
		},
		meta: {
			requestId: res.locals.requestId,
		},
	});
});

app.use((req: Request, res: Response) => {
	res.status(404).json({
		success: false,
		error: {
			code: "NOT_FOUND",
			message: `Route not found: ${req.method} ${req.originalUrl}`,
		},
		meta: {
			requestId: res.locals.requestId,
		},
	});
});

app.use(
	(
		error: ErrorWithStatus,
		_req: Request,
		res: Response,
		_next: NextFunction,
	) => {
		const statusCode = error.statusCode ?? 500;

		res.status(statusCode).json({
			success: false,
			error: {
				code: error.code ?? "INTERNAL_SERVER_ERROR",
				message: statusCode >= 500 && isProduction ? "Internal server error" : error.message,
				details: error.details,
			},
			meta: {
				requestId: res.locals.requestId,
			},
		});
	},
);

const server = app.listen(port, () => {
	console.log(`API listening on port http://localhost:${port}`);
});

type ShutdownSignal = "SIGINT" | "SIGTERM";

const shutdown = (signal: ShutdownSignal) => {
	console.log(`${signal} received. Closing HTTP server...`);
	server.close(async (closeError?: Error) => {
		if (closeError) {
			console.error("Error during server shutdown", closeError);
			process.exit(1);
			return;
		}

		try {
			await disconnectDatabase();
		} catch (disconnectError) {
			console.error("Error during database shutdown", disconnectError);
			process.exit(1);
			return;
		}

		process.exit(0);
	});
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
