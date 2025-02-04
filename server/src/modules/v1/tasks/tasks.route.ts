import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import { createTaskHandler, createTaskSchema } from "./handlers/create-task.js";
import { deleteTaskHandler, deleteTaskSchema } from "./handlers/delete-task.js";
import { editTaskHandler, editTaskSchema } from "./handlers/edit-task.js";
import { getTasksByUserIdHandler } from "./handlers/get-tasks-by-userid.js";
import { getTasksByUserIdSchema } from "./handlers/get-tasks-by-userid.js";

export default async function tasksRouter(server: FastifyInstance) {
	const typedRouter = server.withTypeProvider<ZodTypeProvider>();
	typedRouter.get("/", {
		schema: {
			tags: ["Tasks"],
		},
		preHandler: [server.authenticate],
		handler: () => {
			return "Tasks Routes";
		},
	});

	typedRouter.get("/me", {
		preHandler: [server.authenticate],
		schema: getTasksByUserIdSchema,
		handler: getTasksByUserIdHandler,
	});

	typedRouter.post("/", {
		preHandler: [server.authenticate],
		schema: createTaskSchema,
		handler: createTaskHandler,
	});

	typedRouter.delete("/:taskId", {
		preHandler: [server.authenticate],
		schema: deleteTaskSchema,
		handler: deleteTaskHandler,
	});

	typedRouter.put("/:taskId", {
		preHandler: [server.authenticate],
		schema: editTaskSchema,
		handler: editTaskHandler,
	});
}
