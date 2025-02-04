import { createTaskservice } from "@/modules/v1/tasks/tasks.service.js";
import { validateDateConstraints } from "@/modules/v1/tasks/utils/date-time.js";
import { errorResponses, httpError } from "@/utils/http-error.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { createUserService } from "../../users/users.service.js";
import { publishTaskNotificationJob } from "./tasks-notification-queue.js";
import { publishTaskUpdate } from "./tasks-pub-sub.js";

export const createTaskSchema = {
	tags: ["Tasks"],
	body: z.object({
		title: z.string(),
		description: z.string(),
		dueDate: z.string().datetime(),
		reminderTime: z.string().datetime().optional(),
		status: z.enum(["planned", "in progress", "completed"]),
	}),
	response: {
		...errorResponses,
	},
};

export async function createTaskHandler(
	req: FastifyRequest<{
		Body: z.infer<typeof createTaskSchema.body>;
	}>,
	res: FastifyReply,
) {
	const { title, description, dueDate, reminderTime, status } = req.body;

	try {
		const { newDueDate, newReminderTime } = validateDateConstraints(
			dueDate,
			reminderTime,
		);

		const taskService = createTaskservice({ db: req.server.db });
		const newTask = await taskService.createTask({
			title,
			description,
			dueDate: newDueDate.toString(),
			reminderTime: newReminderTime.toString(),
			status,
			userId: req.userData.id,
		});

		if (!newTask) {
			return httpError({
				reply: res,
				message: "Failed to create task",
				code: 500,
				cause: "Failed to create task",
			});
		}

		if (req.server.kv) {
			publishTaskUpdate(req.server.kv.publisher, req.userData.id);
		}

		const userService = createUserService({ db: req.server.db });
		const user = await userService.getUserById(newTask.userId);

		if (user?.fcmTokens && Array.isArray(user.fcmTokens)) {
			for (const token of user.fcmTokens) {
				publishTaskNotificationJob({
					app: req.server,
					userId: newTask.userId,
					taskId: newTask.id,
					token,
					title: newTask.title,
					body: newTask.description ?? "",
					delay: newReminderTime.diffNow().toMillis(),
				});
			}
		}

		res.send({ task: newTask });
	} catch (error) {
		const err = error as Error;

		req.log.error(err.message);

		return httpError({
			reply: res,
			message: "Failed to create task",
			code: 500,
			cause: err.message,
		});
	}
}
