import type { TasksSelectModelType } from "@/db/schema/index.js";
import { createTaskservice } from "@/modules/v1/tasks/tasks.service.js";
import type { FastifyInstance } from "fastify";
import type { Redis } from "ioredis";

const TASK_UPDATES_CHANNEL = "tasks-updates";

export type TaskSubscription = {
	[TASK_UPDATES_CHANNEL]: (taskItems: TasksSelectModelType[]) => void;
};

export function setupKVSubscription(app: FastifyInstance) {
	app.kv.subscriber.subscribe(TASK_UPDATES_CHANNEL, (err) => {
		if (err) {
			app.log.error("Failed to subscribe to task-updates channel", err);
		} else {
			app.log.info("Subscribed to task-updates channel");
		}
	});

	app.kv.subscriber.on("message", async (channel, message) => {
		if (channel === TASK_UPDATES_CHANNEL) {
			const { userId } = JSON.parse(message);

			const taskService = createTaskservice({ db: app.db });
			const tasks = await taskService.getTasksByUserId(userId);

			app.io.to(userId).emit(TASK_UPDATES_CHANNEL, tasks);
		}
	});
}

export function publishTaskUpdate(publisher: Redis, userId: string) {
	publisher.publish(TASK_UPDATES_CHANNEL, JSON.stringify({ userId }));
}
