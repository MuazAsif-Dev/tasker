import tasksRouter from "@/modules/v1/tasks/tasks.route.js";
import usersRouter from "@/modules/v1/users/users.route.js";
import { httpError } from "@/utils/http-error.js";
import type { FastifyInstance } from "fastify";

export default async function router(router: FastifyInstance) {
	router.register(usersRouter, { prefix: "/users" });
	router.register(tasksRouter, { prefix: "/tasks" });

	router.setNotFoundHandler((request, reply) => {
		return httpError({
			reply,
			message: "Not Found",
			code: 404,
			cause: "The requested resource was not found on this server.",
		});
	});
}
