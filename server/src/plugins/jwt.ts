import { env } from "@/config/env.js";
import fastifyJwt from "@fastify/jwt";
import type { FastifyInstance, FastifyPluginOptions } from "fastify";
import type { FastifyReply, FastifyRequest } from "fastify";
import fp from "fastify-plugin";

export default fp(
	async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
		fastify.register(fastifyJwt, {
			secret: env.JWT_SECRET,
		});

		fastify.decorate(
			"authenticate",
			async (request: FastifyRequest, reply: FastifyReply) => {
				try {
					const decoded = await request.jwtVerify();
					request.userData = decoded as { id: string; email: string };
				} catch (err) {
					reply.send(err);
				}
			},
		);
	},
);
