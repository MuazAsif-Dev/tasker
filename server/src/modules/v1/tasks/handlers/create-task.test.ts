import type { FastifyReply, FastifyRequest } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { z } from "zod";
import { createTaskHandler } from "./create-task.js";
import type { createTaskSchema } from "./create-task.js";

vi.mock("@/modules/v1/tasks/tasks.service.js", () => ({
	createTaskservice: () => ({
		createTask: vi.fn().mockImplementation((task) => {
			if (task.title === "Error Task") {
				throw new Error("Database error");
			}
			return Promise.resolve({
				id: "1",
				title: task.title,
				description: task.description,
				dueDate: task.dueDate,
				reminderTime: task.reminderTime,
				status: task.status,
				userId: task.userId,
			});
		}),
	}),
}));

vi.mock("@/modules/v1/users/users.service.js", () => ({
	createUserService: () => ({
		getUserById: vi.fn().mockImplementation((userId) => {
			return Promise.resolve({
				id: userId,
				fcmTokens: ["test-token"],
			});
		}),
	}),
}));

const mockRequest = (
	body: z.infer<typeof createTaskSchema.body>,
	userId: string,
) =>
	({
		body,
		server: {
			db: {},
			kv: { publisher: { publish: vi.fn() } },
			queue: {
				getQueue: vi.fn().mockReturnValue({
					add: vi.fn().mockResolvedValue(true),
				}),
			},
			log: {
				info: vi.fn(),
				error: vi.fn(),
				debug: vi.fn(),
				warn: vi.fn(),
			},
		},
		userData: { id: userId },
		log: {
			info: vi.fn(),
			error: vi.fn(),
			debug: vi.fn(),
			warn: vi.fn(),
		},
	}) as unknown as FastifyRequest<{
		Body: z.infer<typeof createTaskSchema.body>;
	}>;

const mockReply = () => {
	const res = {} as FastifyReply;
	res.status = vi.fn().mockReturnValue(res);
	res.send = vi.fn().mockReturnValue(res);
	return res;
};

describe("createTaskHandler", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should create a task successfully", async () => {
		const req = mockRequest(
			{
				title: "Test Task",
				description: "Test Description",
				dueDate: new Date().toISOString(),
				reminderTime: new Date().toISOString(),
				status: "planned",
			},
			"user-1",
		);
		const res = mockReply();

		await createTaskHandler(req, res);

		expect(res.send).toHaveBeenCalledWith({
			task: expect.objectContaining({
				title: "Test Task",
				description: "Test Description",
			}),
		});
	});

	it("should handle errors gracefully", async () => {
		const req = mockRequest(
			{
				title: "Error Task",
				description: "Test Description",
				dueDate: new Date().toISOString(),
				reminderTime: new Date().toISOString(),
				status: "planned",
			},
			"user-1",
		);
		const res = mockReply();

		await createTaskHandler(req, res);

		expect(res.send).toHaveBeenCalledWith({
			message: "Failed to create task",
			cause: "Database error",
			metadata: undefined,
		});
	});
});
