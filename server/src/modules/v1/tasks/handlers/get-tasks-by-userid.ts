import { createTaskservice } from "@/modules/v1/tasks/tasks.service.js";
import { errorResponses, httpError } from "@/utils/http-error.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export const getTasksByUserIdSchema = {
	tags: ["Tasks"],
	querystring: z.object({
		cursor: z
			.object({
				id: z.string(),
				createdAt: z.string(),
			})
			.optional(),
		pageSize: z.number().optional().default(10),
	}),
	response: {
		...errorResponses,
	},
};

export async function getTasksByUserIdHandler(
	req: FastifyRequest<{
		Querystring: z.infer<typeof getTasksByUserIdSchema.querystring>;
	}>,
	res: FastifyReply,
) {
	const { cursor, pageSize } = req.query;
	try {
		const taskService = createTaskservice({ db: req.server.db });
		const tasks = await taskService.getTasksByUserId(
			req.userData.id,
			cursor?.id && cursor?.createdAt
				? {
						id: cursor.id,
						createdAt: new Date(cursor.createdAt),
					}
				: undefined,
			pageSize,
		);

		if (!tasks) {
			return httpError({
				reply: res,
				message: "Failed to fetch tasks",
				code: 404,
				cause: "Tasks not found",
			});
		}

		res.send({
			message: `Tasks with userId ${req.userData.id} fetched successfully`,
			tasks,
		});
	} catch (error) {
		const err = error as Error;

		req.log.error(err.message);

		return httpError({
			reply: res,
			message: "Failed to fetch tasks",
			code: 500,
			cause: err.message,
		});
	}
}
