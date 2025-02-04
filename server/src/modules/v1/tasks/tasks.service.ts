import type { DB } from "@/db/index.js";
import {
	type TasksInsertModelType,
	type TasksSelectModelType,
	tasks,
} from "@/db/schema/index.js";
import { and, asc, eq, gt, or } from "drizzle-orm";

export interface ServiceContext {
	db: DB;
}

export function createTaskservice(ctx: ServiceContext) {
	return {
		async getTaskById(id: TasksSelectModelType["id"]) {
			const result = await ctx.db.select().from(tasks).where(eq(tasks.id, id));
			return result[0];
		},
		async createTask(data: TasksInsertModelType) {
			const result = await ctx.db.insert(tasks).values(data).returning();
			return result[0];
		},
		async getTasksByUserId(
			userId: TasksSelectModelType["userId"],
			cursor?: {
				id: string;
				createdAt: Date;
			},
			pageSize = 100,
		) {
			const result = await ctx.db
				.select()
				.from(tasks)
				.where(
					cursor
						? and(
								eq(tasks.userId, userId),
								or(
									gt(tasks.createdAt, cursor.createdAt),
									and(
										eq(tasks.createdAt, cursor.createdAt),
										gt(tasks.id, cursor.id),
									),
								),
							)
						: eq(tasks.userId, userId),
				)
				.limit(pageSize)
				.orderBy(asc(tasks.createdAt), asc(tasks.id));

			return result;
		},
		async deleteTask(
			id: TasksSelectModelType["id"],
			userId: TasksSelectModelType["userId"],
		) {
			const result = await ctx.db
				.delete(tasks)
				.where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
				.returning({ deletedId: tasks.id });
			return result[0];
		},
		async updateTask(
			id: TasksSelectModelType["id"],
			userId: TasksSelectModelType["userId"],
			data: Partial<
				Pick<
					TasksInsertModelType,
					"title" | "description" | "dueDate" | "reminderTime" | "status"
				>
			>,
		) {
			const result = await ctx.db
				.update(tasks)
				.set(data)
				.where(and(eq(tasks.id, id), eq(tasks.userId, userId)))
				.returning();
			return result[0];
		},
	};
}
