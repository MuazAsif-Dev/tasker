import { env } from "@/config/env.js";
import { initDB, ping } from "@/db/index.js";
import { createServer } from "@/server.js";
import closeWithGrace from "close-with-grace";
import { Redis } from "ioredis";

async function main() {
	const { db } = await initDB();

	const publisher = new Redis(env.REDIS_URI);
	const subscriber = new Redis(env.REDIS_URI);

	const kv = { publisher, subscriber };

	try {
		await ping(db);
	} catch (e) {
		console.error("❌ Database connection failed");
		process.exit(1);
	}

	try {
		await Promise.all([
			publisher.ping(),
			subscriber.ping()
		]);
	} catch (e) {
		console.error("❌ Redis connection failed");
		process.exit(1);
	}

	const server = await createServer({ db, kv });

	server.listen({ port: env.PORT, host: env.HOST }, (err) => {
		if (err) {
			server.log.error(err);
			process.exit(1);
		}
	});

	server.log.debug(env, "Here are the envs");

	server.log.debug(
		server.printRoutes({ commonPrefix: false, includeHooks: true }),
	);

	closeWithGrace(async ({ signal, err, manual }) => {
		if (err) {
			server.log.error({ err }, "server closing with error");
		} else {
			server.log.info(`${signal} received, server closing`);
		}
		await server.close();
	});
}

main();
