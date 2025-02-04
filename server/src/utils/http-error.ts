import type { FastifyReply } from "fastify";
import type { StatusCodes } from "http-status-codes";
import { z } from "zod";

export function httpError({
	reply,
	message,
	code,
	cause,
	metadata,
}: {
	reply: FastifyReply;
	message: string;
	code: StatusCodes;
	cause?: Error["cause"];
	metadata?: Record<string, unknown>;
}) {
	return reply.status(code).send({
		message,
		cause,
		metadata,
	});
}

export const httpErrorSchema = z.object({
	message: z.string(),
	cause: z.string().optional(),
	metadata: z.record(z.unknown()).optional(),
});

export const errorResponses = {
	404: httpErrorSchema,
	400: httpErrorSchema,
	401: httpErrorSchema,
	500: httpErrorSchema,
};
