import type { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

const timestamps = {
	createdAt: timestamp("created_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
	updatedAt: timestamp("updated_at", { withTimezone: true })
		.defaultNow()
		.$onUpdate(() => new Date())
		.notNull(),
};

export const users = pgTable("users", {
	id: uuid("id").primaryKey().defaultRandom(),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	password: text("password"),
	providers: jsonb("providers").default("[]"),
	fcmTokens: jsonb("fcm_tokens").default("[]").notNull(),
	...timestamps,
});

export type UsersSelectModelType = InferSelectModel<typeof users>;
export type UsersInsertModelType = InferInsertModel<typeof users>;

export const tasks = pgTable("tasks", {
	id: uuid("id").primaryKey().defaultRandom(),
	title: text("title").notNull(),
	description: text("description"),
	dueDate: timestamp("due_date", { withTimezone: true, mode: "string" }),
	reminderTime: timestamp("reminder_time", {
		withTimezone: true,
		mode: "string",
	}),
	status: text("status", {
		enum: ["planned", "in progress", "completed"],
	}).notNull(),
	userId: uuid("user_id")
		.references(() => users.id, { onDelete: "cascade" })
		.notNull(),
	...timestamps,
});

export type TasksSelectModelType = InferSelectModel<typeof tasks>;
export type TasksInsertModelType = InferInsertModel<typeof tasks>;
