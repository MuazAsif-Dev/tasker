import type { FastifyError, FastifyReply, FastifyRequest } from "fastify";
import type { ResponseSerializationError } from "fastify-type-provider-zod";
import { httpError } from "./http-error.js";

export function handleValidationError(
	err: FastifyError,
	req: FastifyRequest,
	res: FastifyReply,
) {
	return httpError({
		reply: res,
		message: "Request Validation Error",
		code: 400,
		cause: "The request doesn't match the schema",
		metadata: {
			issues: err.validation,
			method: req.method,
			url: req.url,
		},
	});
}

export function handleSerializationError(
	err: ResponseSerializationError,
	req: FastifyRequest,
	res: FastifyReply,
) {
	return httpError({
		reply: res,
		message: "Response Validation Error",
		code: 500,
		cause: "The response doesn't match the schema",
		metadata: {
			issues: err.cause.issues,
			method: err.method,
			url: err.url,
		},
	});
}
