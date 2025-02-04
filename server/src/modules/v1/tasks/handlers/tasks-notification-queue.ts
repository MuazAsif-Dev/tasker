import type { FastifyInstance } from "fastify";

type TaskJobType = {
	userId: string;
	taskId: string;
	token: string;
	title: string;
	body: string;
	deviceId: string;
};

const TASKS_NOTIFICATION_QUEUE = "tasks-notification-queue";

export function setupTasksNotificationQueue(
	app: FastifyInstance,
	task: (data: TaskJobType) => void,
) {
	const queue = app.queue;

	queue.registerQueue(TASKS_NOTIFICATION_QUEUE, async (data) => {
		const { userId, taskId, token, title, body, deviceId } =
			data as TaskJobType;
		task({ userId, taskId, token, title, body, deviceId });
	});

	const worker = queue.getWorker(TASKS_NOTIFICATION_QUEUE);

	worker?.on("completed", (job) => {
		try {
			app.log.info(
				`Job:${job?.id} Completed - Data: ${JSON.stringify(job?.data)}`,
			);
		} catch (error) {
			app.log.info(
				`Job:${job?.id} Completed - Data: [Unable to stringify job data]`,
			);
		}
	});

	worker?.on("failed", (job, error) => {
		app.log.error(`Job:${job?.id} Failed - Error: ${error.message}`);
	});
}

/**
 * Creates a unique job ID for a task notification
 */
function createNotificationJobId(taskId: string, deviceId: string) {
	return `${taskId}:notification:${deviceId}`;
}

/**
 * Extracts the task ID from a notification job ID
 */
function getTaskIdFromJobId(jobId: string) {
	return jobId.split(":")[0];
}

/**
 * Note: Each notification job has a unique ID in the format taskId:notification:deviceId
 */
export function publishTaskNotificationJob({
	app,
	userId,
	taskId,
	token,
	title,
	body,
	delay,
}: {
	app: FastifyInstance;
	userId: string;
	taskId: string;
	token: string;
	title: string;
	body: string;
	delay: number;
}) {
	const queue = app.queue;
	const notificationQueue = queue.getQueue(TASKS_NOTIFICATION_QUEUE);

	// Using the token as a device identifier since it's unique per device
	const deviceId = token;
	const jobId = createNotificationJobId(taskId, deviceId);

	notificationQueue
		?.add(
			"task-notification-job",
			{ userId, taskId, token, title, body, deviceId },
			{ delay, jobId },
		)
		.then(() =>
			app.log.debug(
				`Job with taskId:${taskId} and userId:${userId} added to the queue.`,
			),
		)
		.catch((error) => {
			app.log.error(
				`Failed to add job with taskId:${taskId} and userId:${userId} to the queue. Error: ${error.message}`,
				error,
			);
		});
}

export async function updateTaskNotificationJob({
	app,
	taskId,
	userId,
	token,
	title,
	body,
	newDelay,
}: {
	app: FastifyInstance;
	taskId: string;
	userId: string;
	newDelay: number;
	token: string;
	title: string;
	body: string;
}) {
	const queue = app.queue;
	const notificationQueue = queue.getQueue(TASKS_NOTIFICATION_QUEUE);

	try {
		const jobs = await notificationQueue?.getJobs();
		const taskJobs =
			jobs?.filter((job) => getTaskIdFromJobId(job.id) === taskId) || [];

		await Promise.all(taskJobs.map((job) => job.remove()));

		publishTaskNotificationJob({
			app,
			userId,
			taskId,
			token,
			title,
			body,
			delay: newDelay,
		});

		app.log.info(
			`Jobs for taskId:${taskId} updated with new delay ${newDelay}.`,
		);
	} catch (error) {
		app.log.error(
			`Failed to update delay for jobs with taskId:${taskId}`,
			error,
		);
	}
}

export async function deleteTaskNotificationJob({
	app,
	taskId,
}: {
	app: FastifyInstance;
	taskId: string;
}) {
	const queue = app.queue;
	const notificationQueue = queue.getQueue(TASKS_NOTIFICATION_QUEUE);

	try {
		const jobs = await notificationQueue?.getJobs();
		const taskJobs =
			jobs?.filter((job) => getTaskIdFromJobId(job.id) === taskId) || [];

		await Promise.all(taskJobs.map((job) => job.remove()));

		app.log.info(
			`All notification jobs for taskId:${taskId} have been deleted.`,
		);
	} catch (error) {
		app.log.error(
			`Failed to delete notification jobs for taskId:${taskId}`,
			error,
		);
	}
}
