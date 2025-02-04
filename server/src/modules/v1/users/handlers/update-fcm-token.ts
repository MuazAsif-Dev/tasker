import { createUserService } from "@/modules/v1/users/users.service.js";
import { errorResponses, httpError } from "@/utils/http-error.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";

export const updateFcmTokenSchema = {
	tags: ["Users"],
	body: z.object({
		fcmToken: z.string(),
	}),
	response: {
		...errorResponses,
	},
};

export async function updateFcmTokenHandler(
	request: FastifyRequest<{
		Body: z.infer<typeof updateFcmTokenSchema.body>;
	}>,
	reply: FastifyReply,
) {
	try {
		const { fcmToken } = request.body;
		const userId = request.userData.id;

		const userService = createUserService({ db: request.server.db });
		const user = await userService.getUserById(userId);

		if (!user) {
			return httpError({
				reply,
				message: "User not found",
				code: 404,
			});
		}

		const currentTokens = user.fcmTokens as string[];
		if (!currentTokens.includes(fcmToken)) {
			currentTokens.push(fcmToken);
		}

		const updatedUser = await userService.updateFcmToken(userId, currentTokens);

		if (!updatedUser) {
			return httpError({
				reply,
				message: "Failed to update FCM token",
				code: 500,
			});
		}
		return reply.send({ message: "FCM token updated successfully" });
	} catch (error) {
		return httpError({
			reply,
			message: "Failed to update FCM token",
			code: 500,
			cause: error,
		});
	}
}
