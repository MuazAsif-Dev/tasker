import cors from "@fastify/cors";
import rateLimit from "@fastify/rate-limit";
import Fastify from "fastify";

import { env } from "@/config/env.js";
import { sendNotification } from "@/config/firebase.js";
import { loggerConfig } from "@/config/logger.js";
import type { DB } from "@/db/index.js";
import router from "@/modules/v1/routes.js";
import {
	publishTaskNotificationJob,
	setupTasksNotificationQueue,
	updateTaskNotificationJob,
} from "@/modules/v1/tasks/handlers/tasks-notification-queue.js";
import {
	type TaskSubscription,
	setupKVSubscription,
} from "@/modules/v1/tasks/handlers/tasks-pub-sub.js";
import FastifyJobQueue, { type QueueNamespace } from "@/plugins/job-queue.js";
import jwtPlugin from "@/plugins/jwt.js";
import { ScalarOpenApiDocsPlugin } from "@/plugins/scalar-docs.js";
import fastifySocketIo from "@/plugins/socket-io.js";
import { httpError } from "@/utils/http-error.js";
import {
	handleSerializationError,
	handleValidationError,
} from "@/utils/validation-error.js";
import {
	hasZodFastifySchemaValidationErrors,
	isResponseSerializationError,
	serializerCompiler,
	validatorCompiler,
} from "fastify-type-provider-zod";
import type { Redis } from "ioredis";
import type { Server } from "socket.io";

declare module "fastify" {
	interface FastifyInstance {
		db: DB;
		io: Server<TaskSubscription>;
		kv: KV;
		authenticate: (
			request: FastifyRequest,
			reply: FastifyReply,
		) => Promise<void>;
		queue: QueueNamespace;
	}
}

declare module "fastify" {
	interface FastifyRequest {
		userData: {
			id: string;
			email: string;
		};
	}
}

interface KV {
	publisher: Redis;
	subscriber: Redis;
}

export async function createServer({ db, kv }: { db: DB; kv: KV }) {
	const app = Fastify({
		logger: loggerConfig[env.NODE_ENV],
	});

	app.setValidatorCompiler(validatorCompiler);
	app.setSerializerCompiler(serializerCompiler);

	app.decorate("db", db);
	app.decorate("kv", kv);

	app.register(cors, {
		origin: env.CORS_ALLOWED_ORIGINS,
	});

	app.register(rateLimit, {
		max: 60,
		timeWindow: 60 * 1000,
	});

	app.register(jwtPlugin);

	app.register(fastifySocketIo, {
		cors: {
			origin: env.CORS_ALLOWED_ORIGINS,
		},
	});

	app.register(ScalarOpenApiDocsPlugin);

	app.register(router, { prefix: "/api/v1" });

	setupKVSubscription(app);

	app.register(FastifyJobQueue, {
		redisUrl: env.REDIS_URI,
	});

	app.ready().then(() => {
		setupTasksNotificationQueue(app, async (data) => {
			try {
				await sendNotification({
					title: data.title,
					body: data.body,
					token: data.token,
				});
				app.log.info("Notification triggered", data);
			} catch (error) {
				app.log.error("Failed to send notification", error);
			}
		});
	});

	app.register((fastify) => {
		fastify.get("/openapi.json", async () => {
			return fastify.swagger();
		});

		fastify.get("/healthcheck", async () => {
			return { message: "Server is running" };
		});

		fastify.post("/send-notification", async (req, res) => {
			const { token, title, body } = req.body as {
				token: string;
				title: string;
				body: string;
			};

			try {
				const response = await sendNotification({
					token,
					title,
					body,
				});

				return res.send({ response });
			} catch (error) {
				return httpError({
					reply: res,
					message: "Failed to send notification",
					code: 500,
					cause: error,
				});
			}
		});
	});

	app.setErrorHandler(async (err, req, res) => {
		app.log.error({ err });

		if (hasZodFastifySchemaValidationErrors(err)) {
			return handleValidationError(err, req, res);
		}

		if (isResponseSerializationError(err)) {
			return handleSerializationError(err, req, res);
		}

		return httpError({
			reply: res,
			message: err.message || "An error has occured",
			code: err.statusCode || 500,
			cause: err.cause,
		});
	});

	await app.ready();

	return app;
}
