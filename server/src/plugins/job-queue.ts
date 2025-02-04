import { type Job, Queue, Worker } from "bullmq";
import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { Redis, type RedisOptions } from "ioredis";

type JobQueuePluginOptions = {
	redisUrl: string;
	bullmqOptions?: object;
	redisOptions?: RedisOptions;
};

export type QueueNamespace = {
	registerQueue: (
		name: string,
		processJob: (data: Record<string, unknown>) => Promise<void>,
		onSuccess?: (job: Job) => void,
		onError?: (job: Job, err: Error) => void,
	) => void;
	getQueue: (name: string) => Queue | undefined;
	getWorker: (name: string) => Worker | undefined;
};

const FastifyJobQueue: FastifyPluginAsync<JobQueuePluginOptions> = fp(
	async (fastify: FastifyInstance, opts: JobQueuePluginOptions) => {
		if (!opts.redisUrl) {
			throw new Error("Redis URL is required");
		}

		const connection = new Redis(opts.redisUrl, {
			...opts.redisOptions,
			maxRetriesPerRequest: null,
		});

		const queues: Record<string, Queue> = {};
		const workers: Record<string, Worker> = {};

		const queueNamespace: QueueNamespace = {
			registerQueue: (
				name: string,
				processJob: (data: Record<string, unknown>) => Promise<void>,
				onSuccess?: (job: Job) => void,
				onError?: (job: Job, err: Error) => void,
			) => {
				if (queues[name] || workers[name]) {
					throw new Error(`Queue with name ${name} already exists`);
				}

				const queue = new Queue(name, {
					connection,
					...opts.bullmqOptions,
				});

				const worker = new Worker(
					name,
					async (job) => {
						await processJob(job.data);
					},
					{ connection },
				);

				worker.on("completed", (job) => {
					if (job) {
						if (onSuccess) {
							onSuccess(job);
						} else {
							fastify.log.info(`Job completed: ${job.id}`);
						}
					}
				});

				worker.on("failed", (job, err) => {
					if (job) {
						if (onError) {
							onError(job, err);
						} else {
							fastify.log.error(`Job failed: ${job.id}`, err);
						}
					}
				});

				queues[name] = queue;
				workers[name] = worker;
			},
			getQueue: (name: string) => {
				return queues[name];
			},
			getWorker: (name: string) => {
				return workers[name];
			},
		};

		fastify.decorate("queue", queueNamespace);

		fastify.addHook("onClose", async (fastify: FastifyInstance) => {
			for (const worker of Object.values(workers)) {
				await worker.close();
			}
			for (const queue of Object.values(queues)) {
				await queue.close();
			}
			connection.disconnect();
		});

		fastify.log.info("Job queue plugin registered");
	},
	{ name: "job-queue-plugin" },
);

export default FastifyJobQueue;
