import { createUserService } from "@/modules/v1/users/users.service.js";
import { errorResponses, httpError } from "@/utils/http-error.js";
import argon2 from "argon2";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export const signupUserSchema = {
	tags: ["Users"],
	body: z.object({
		name: z.string(),
		email: z.string(),
		password: z.string(),
		fcmToken: z.string().optional().nullable(),
	}),
	response: {
		...errorResponses,
	},
};

export async function signupHandler(
	req: FastifyRequest<{
		Body: z.infer<typeof signupUserSchema.body>;
	}>,
	res: FastifyReply,
) {
	const { name, email, password, fcmToken } = req.body;

	try {
		const userService = createUserService({ db: req.server.db });
		const hashedPassword = await argon2.hash(password);

		const existingUser = await userService.getUserByEmail(email);
		if (existingUser) {
			return httpError({
				reply: res,
				message: "Failed to signup",
				code: 400,
				cause: "User already exists",
			});
		}

		const newUser = await userService.createUser({
			name,
			email,
			password: hashedPassword,
			fcmTokens: fcmToken ? [fcmToken] : [],
		});

		if (!newUser) {
			return httpError({
				reply: res,
				message: "Failed to signup",
				code: 400,
				cause: "User creation failed",
			});
		}

		res.send({ message: "User created successfully" });
	} catch (error) {
		const err = error as Error;

		req.log.error(err.message);

		return httpError({
			reply: res,
			message: "Failed to signup",
			code: 500,
			cause: err.message,
		});
	}
}
