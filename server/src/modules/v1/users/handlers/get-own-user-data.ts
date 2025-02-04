import { createUserService } from "@/modules/v1/users/users.service.js";
import { errorResponses, httpError } from "@/utils/http-error.js";
import type { FastifyReply, FastifyRequest } from "fastify";

export const getOwnUserDataSchema = {
	tags: ["Users"],
	response: {
		...errorResponses,
	},
};

export async function getOwnUserDataHandler(
	req: FastifyRequest,
	res: FastifyReply,
) {
	const { id } = req.userData;

	try {
		const userService = createUserService({ db: req.server.db });
		const user = await userService.getUserById(id);
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
