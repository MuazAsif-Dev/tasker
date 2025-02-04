import { createUserService } from "@/modules/v1/users/users.service.js";
import { errorResponses, httpError } from "@/utils/http-error.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export const getUserByIdSchema = {
	tags: ["Users"],
	params: z.object({
		userId: z.string(),
	}),
	response: {
		...errorResponses,
	},
};

export async function getUserByIdHandler(
	req: FastifyRequest<{
		Params: z.infer<typeof getUserByIdSchema.params>;
	}>,
	res: FastifyReply,
) {
	const { userId } = req.params;
	try {
		const userService = createUserService({ db: req.server.db });
		const user = await userService.getUserById(userId);
		if (!user) {
			return httpError({
				reply: res,
				message: "Failed to fetch user",
				code: 404,
				cause: "User not found",
			});
		}
		res.send({ user });
	} catch (error) {
		const err = error as Error;

		req.log.error(err.message);

		return httpError({
			reply: res,
			message: "Failed to fetch user",
			code: 500,
			cause: err.message,
		});
	}
}
