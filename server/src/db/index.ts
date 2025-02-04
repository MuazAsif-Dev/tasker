import { type NodePgDatabase, drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import { env } from "@/config/env.js";
import * as schema from "@/db/schema/index.js";
import { sql } from "drizzle-orm";

export type DB = NodePgDatabase<typeof schema>;

export type Client = pg.Pool | pg.Client;

export async function initDB(url: string = env.DATABASE_URI) {
	const { Pool } = pg;
	const pool = new Pool({
		connectionString: url,
		ssl: env.NODE_ENV === "production",
	});

	const db = drizzle({
		client: pool,
		schema: { ...schema },
	});

	return { db, dbClient: pool };
}

export async function ping(db: DB) {
	return db.execute(sql`SELECT 1`);
}

export async function closeDB(dbClient: Client) {
	await dbClient.end();
}
