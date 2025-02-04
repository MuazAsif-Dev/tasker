import { env } from "@/config/env.js";
import { createUserService } from "@/modules/v1/users/users.service.js";
import { errorResponses, httpError } from "@/utils/http-error.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { OAuth2Client } from "google-auth-library";
import { z } from "zod";

export const googleLoginUserSchema = {
	tags: ["Users"],
	body: z.object({
		token: z.string(),
		fcmToken: z.string().optional().nullable(),
	}),
	response: {
		...errorResponses,
	},
};

export async function googleLoginHandler(
	req: FastifyRequest<{
		Body: z.infer<typeof googleLoginUserSchema.body>;
	}>,
	res: FastifyReply,
) {
	const { token, fcmToken } = req.body;

	try {
		const CLIENT_ID = env.GOOGLE_CLIENT_ID;

		const client = new OAuth2Client(CLIENT_ID);

		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: CLIENT_ID,
		});

		const payload = ticket.getPayload();

		if (!payload || !payload.email) {
			return httpError({
				reply: res,
				message: "Failed to login",
				code: 500,
				cause: "Invalid token payload",
			});
		}

		const userService = createUserService({ db: req.server.db });
		const userRecord = await userService.getUserByEmail(payload.email);

		if (userRecord) {
			const userToken = req.server.jwt.sign({
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

			return res.status(200).send({ token: userToken });
		}

		const newUser = await userService.createUser({
			name: payload.name || payload.given_name || payload.email,
			email: payload.email,
			providers: [
				{
					provider: "google",
					providerId: payload.sub,
				},
			],
			fcmTokens: fcmToken ? [fcmToken] : [],
		});

		if (!newUser) {
			return httpError({
				reply: res,
				message: "Failed to create user",
				code: 500,
				cause: "Failed to create user",
			});
		}

		const userToken = req.server.jwt.sign({
			id: newUser.id,
			email: newUser.email,
		});

		return res.status(200).send({ token: userToken });
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
