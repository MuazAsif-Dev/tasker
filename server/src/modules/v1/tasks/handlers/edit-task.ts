import { createTaskservice } from "@/modules/v1/tasks/tasks.service.js";
import { validateDateConstraints } from "@/modules/v1/tasks/utils/date-time.js";
import { createUserService } from "@/modules/v1/users/users.service.js";
import { errorResponses, httpError } from "@/utils/http-error.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { updateTaskNotificationJob } from "./tasks-notification-queue.js";
import { publishTaskUpdate } from "./tasks-pub-sub.js";

export const editTaskSchema = {
	tags: ["Tasks"],
	params: z.object({
		taskId: z.string(),
	}),
	body: z.object({
		title: z.string().optional(),
		description: z.string().optional(),
		dueDate: z.string().datetime().optional(),
		reminderTime: z.string().datetime().optional(),
		status: z.enum(["planned", "in progress", "completed"]).optional(),
	}),
	response: {
		...errorResponses,
	},
};

export async function editTaskHandler(
	req: FastifyRequest<{
		Params: z.infer<typeof editTaskSchema.params>;
		Body: z.infer<typeof editTaskSchema.body>;
	}>,
	res: FastifyReply,
) {
	const { taskId } = req.params;
	const { title, description, dueDate, reminderTime, status } = req.body;

	try {
		const { newDueDate, newReminderTime } = validateDateConstraints(
			dueDate,
			reminderTime,
		);

		const taskService = createTaskservice({ db: req.server.db });
		const updatedTask = await taskService.updateTask(taskId, req.userData.id, {
			title,
			description,
			dueDate: dueDate ? newDueDate.toString() : undefined,
			reminderTime: reminderTime ? newReminderTime.toString() : undefined,
			status,
		});

		if (!updatedTask) {
			return httpError({
				reply: res,
				message: "Failed to update task",
				code: 404,
				cause: "Task not found",
			});
		}

		if (req.server.kv) {
			publishTaskUpdate(req.server.kv.publisher, req.userData.id);
		}

		const userService = createUserService({ db: req.server.db });
		const user = await userService.getUserById(updatedTask.userId);

		if (user?.fcmTokens && Array.isArray(user.fcmTokens)) {
			for (const token of user.fcmTokens) {
				updateTaskNotificationJob({
					app: req.server,
					taskId: updatedTask.id,
					userId: updatedTask.userId,
					newDelay: newReminderTime.diffNow().toMillis(),
					token,
					title: updatedTask.title,
					body: updatedTask.description ?? "",
				});
			}
		}

		res.send({
			message: `Task with id ${updatedTask.id} updated successfully`,
			task: updatedTask,
		});
	} catch (error) {
		const err = error as Error;

		req.log.error(err.message);

		return httpError({
			reply: res,
			message: "Failed to update task",
			code: 500,
			cause: err.message,
		});
	}
}
