import type { DB } from "@/db/index.js";
import {
	type UsersInsertModelType,
	type UsersSelectModelType,
	users,
} from "@/db/schema/index.js";
import { eq, getTableColumns } from "drizzle-orm";

export interface ServiceContext {
	db: DB;
}

export function createUserService(ctx: ServiceContext) {
	return {
		async getUserById(id: UsersSelectModelType["id"]) {
			const { password: _, ...rest } = getTableColumns(users);

			const result = await ctx.db
				.select({ ...rest })
				.from(users)
				.where(eq(users.id, id));
			return result[0];
		},
		async createUser(data: UsersInsertModelType) {
			const { password: _, ...rest } = getTableColumns(users);

			const result = await ctx.db
				.insert(users)
				.values(data)
				.returning({ ...rest });
			return result[0];
		},
		async getUserByEmail(email: UsersSelectModelType["email"]) {
			const result = await ctx.db
				.select()
				.from(users)
				.where(eq(users.email, email));
			return result[0];
		},
		async updateFcmToken(
			userId: UsersSelectModelType["id"],
			fcmTokens: string[],
		) {
			const updatedUser = await ctx.db
				.update(users)
				.set({ fcmTokens })
				.where(eq(users.id, userId))
				.returning();

			return updatedUser[0];
		},
	};
}
