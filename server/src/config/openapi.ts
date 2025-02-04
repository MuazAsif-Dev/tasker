import FastifySwagger, {
	type FastifyDynamicSwaggerOptions,
} from "@fastify/swagger";

import { jsonSchemaTransform } from "fastify-type-provider-zod";
import packageJson from "#/package.json" with { type: "json" };

export const OpenAPIConfig = {
	openapi: {
		info: {
			title: "My Fastify App",
			description: "API Reference for my Fastify App",
			version: packageJson.version,
		},
	},
	transform: jsonSchemaTransform,
} as FastifyDynamicSwaggerOptions;
