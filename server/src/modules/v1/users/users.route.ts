import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";

import {
	getOwnUserDataHandler,
	getOwnUserDataSchema,
} from "./handlers/get-own-user-data.js";
import {
	getUserByIdHandler,
	getUserByIdSchema,
} from "./handlers/get-user-by-id.js";
import {
	googleLoginHandler,
	googleLoginUserSchema,
} from "./handlers/google-login.js";
import { loginHandler, loginUserSchema } from "./handlers/login.js";
import { signupHandler, signupUserSchema } from "./handlers/signup.js";
import {
	updateFcmTokenHandler,
	updateFcmTokenSchema,
} from "./handlers/update-fcm-token.js";

export default async function usersRouter(server: FastifyInstance) {
	const typedRouter = server.withTypeProvider<ZodTypeProvider>();
	typedRouter.get("/", {
		schema: {
			tags: ["Users"],
		},
		handler: () => {
			return "Users Routes";
		},
		preHandler: [server.authenticate],
	});

	typedRouter.post("/login", {
		schema: loginUserSchema,
		handler: loginHandler,
	});

	typedRouter.post("/signup", {
		schema: signupUserSchema,
		handler: signupHandler,
	});

	typedRouter.post("/google-login", {
		schema: googleLoginUserSchema,
		handler: googleLoginHandler,
	});

	typedRouter.get("/:userId", {
		schema: getUserByIdSchema,
		handler: getUserByIdHandler,
		preHandler: [server.authenticate],
	});

	typedRouter.get("/me", {
		schema: getOwnUserDataSchema,
		handler: getOwnUserDataHandler,
		preHandler: [server.authenticate],
	});

	typedRouter.post("/fcm-token", {
		schema: updateFcmTokenSchema,
		handler: updateFcmTokenHandler,
		preHandler: [server.authenticate],
	});
}
