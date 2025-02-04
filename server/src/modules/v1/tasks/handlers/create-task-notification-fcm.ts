import { sendNotification } from "@/config/firebase.js";
import { errorResponses, httpError } from "@/utils/http-error.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export const createTaskSchema = {
	tags: ["Tasks"],
	body: z.object({
		message: z.object({
			token: z.string(),
			notification: z.object({
				title: z.string(),
				body: z.string(),
			}),
		}),
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
	const { message } = req.body;

	try {
		const response = await sendNotification({
			token: message.token,
			title: message.notification.title,
			body: message.notification.body,
		});

		if (!response) {
			return httpError({
				reply: res,
				message: "Failed to create task notification",
				code: 500,
				cause: "Failed to create task notification",
			});
		}

		return res.send({ response });
	} catch (error) {
		const err = error as Error;

		req.log.error(err.message);

		return httpError({
			reply: res,
			message: "Failed to create task notification",
			code: 500,
			cause: err.message,
		});
	}
}
