import { env } from "@/config/env.js";
import * as schema from "@/db/schema/index.js";
import { drizzle } from "drizzle-orm/node-postgres";
import { reset, seed } from "drizzle-seed";

export async function seedDatabase(databaseUrl: string = env.DATABASE_URI) {
	try {
		const db = drizzle({
			connection: databaseUrl,
		});

		await reset(db, { ...schema });

		await seed(db, { ...schema }).refine((f) => ({
			users: {
				count: 20,
				columns: {
					name: f.fullName({ isUnique: true }),
					email: f.email(),
					password: f.default({ defaultValue: "hashedpassword" }),
				},
				with: {
					tasks: 10,
				},
			},
			tasks: {
				columns: {
					title: f.companyName({ isUnique: true }),
					description: f.loremIpsum({ sentencesCount: 2 }),
					status: f.valuesFromArray({
						values: ["planned", "in progress", "completed"],
					}),
				},
			},
		}));

		console.log("Database seeding completed.");
		process.exit(0);
	} catch (error) {
		console.error("Error during database seeding:", error);
		process.exit(1);
	}
}

seedDatabase();
