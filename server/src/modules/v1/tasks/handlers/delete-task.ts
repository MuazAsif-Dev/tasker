import { createTaskservice } from "@/modules/v1/tasks/tasks.service.js";
import { errorResponses, httpError } from "@/utils/http-error.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { deleteTaskNotificationJob } from "./tasks-notification-queue.js";
import { publishTaskUpdate } from "./tasks-pub-sub.js";

export const deleteTaskSchema = {
	tags: ["Tasks"],
	params: z.object({
		taskId: z.string(),
	}),
	response: {
		...errorResponses,
	},
};

export async function deleteTaskHandler(
	req: FastifyRequest<{
		Params: z.infer<typeof deleteTaskSchema.params>;
	}>,
	res: FastifyReply,
) {
	const { taskId } = req.params;

	try {
		const taskService = createTaskservice({ db: req.server.db });
		const deletedTask = await taskService.deleteTask(taskId, req.userData.id);

		if (!deletedTask) {
			return httpError({
				reply: res,
				message: "Failed to delete task",
				code: 404,
				cause: "Task not found",
			});
		}

		await deleteTaskNotificationJob({
			app: req.server,
			taskId,
		});

		if (req.server.kv) {
			publishTaskUpdate(req.server.kv.publisher, req.userData.id);
		}

		res.send({
			message: `Task with id ${deletedTask.deletedId} deleted successfully`,
		});
	} catch (error) {
		const err = error as Error;

		req.log.error(err.message);

		return httpError({
			reply: res,
			message: "Failed to delete task",
			code: 500,
			cause: err.message,
		});
	}
}
