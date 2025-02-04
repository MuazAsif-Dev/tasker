import * as dotenv from "dotenv";
import { type ZodError, z } from "zod";

dotenv.config();

const envSchema = z.object({
	PORT: z.number().int().positive().default(8000),
	HOST: z.string().default("0.0.0.0"),
	NODE_ENV: z
		.enum(["development", "staging", "production", "test"])
		.default("development"),
	DATABASE_URI: z.string().url().startsWith("postgres://"),
	JWT_SECRET: z.string().default("defaultsecret"),
	REDIS_URI: z.string().url().startsWith("redis://"),
	CORS_ALLOWED_ORIGINS: z.preprocess(
		(val) =>
			typeof val === "string" ? val.split(",").map((item) => item.trim()) : [],
		z.array(z.string()).default([]),
	),
	GOOGLE_CLIENT_ID: z.string(),
});
let parsedEnv: z.infer<typeof envSchema>;

try {
	parsedEnv = envSchema.parse(process.env);
} catch (e) {
	const error = e as ZodError;
	console.error("❌ Invalid env:");
	console.error(error.flatten().fieldErrors);
	process.exit(1);
}

export const env = parsedEnv;
