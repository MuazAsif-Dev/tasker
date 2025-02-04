import { createUserService } from "@/modules/v1/users/users.service.js";
import { errorResponses, httpError } from "@/utils/http-error.js";
import argon2 from "argon2";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export const loginUserSchema = {
	tags: ["Users"],
	body: z.object({
		email: z.string(),
		password: z.string(),
		fcmToken: z.string().optional().nullable(),
	}),
	response: {
		...errorResponses,
	},
};

export async function loginHandler(
	req: FastifyRequest<{
		Body: z.infer<typeof loginUserSchema.body>;
	}>,
	res: FastifyReply,
) {
	const { email, password, fcmToken } = req.body;

	try {
		const userService = createUserService({ db: req.server.db });
		const userRecord = await userService.getUserByEmail(email);

		if (!userRecord || !userRecord.password) {
			return httpError({
				reply: res,
				message: "Failed to login",
				code: 404,
				cause: "User not found",
			});
		}

		const isPasswordValid = await argon2.verify(userRecord.password, password);

		if (!isPasswordValid) {
			return httpError({
				reply: res,
				message: "Failed to login",
				code: 401,
				cause: "Invalid password",
			});
		}

		const token = req.server.jwt.sign({
			id: userRecord.id,
			email: userRecord.email,
		});

		if (fcmToken) {
			const currentTokens = Array.isArray(userRecord?.fcmTokens)
				? userRecord.fcmTokens
				: [];
			const uniqueTokens = [...new Set([...currentTokens, fcmToken])];
			await userService.updateFcmToken(userRecord.id, uniqueTokens);
		}

		res.send({ token });
	} catch (error) {
		const err = error as Error;

		req.log.error(err.message);

		return httpError({
			reply: res,
			message: "Failed to login",
			code: 500,
			cause: err.message,
		});
	}
}
