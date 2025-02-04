import type { FastifyReply, FastifyRequest } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { z } from "zod";
import { editTaskHandler } from "./edit-task.js";
import type { editTaskSchema } from "./edit-task.js";

vi.mock("@/modules/v1/tasks/tasks.service.js", () => ({
	createTaskservice: () => ({
		updateTask: vi.fn((id, userId, data) => {
			if (id === "task123" && userId === "user-1") {
				return Promise.resolve({ id, ...data });
			}
			if (id === "not-found") {
				return Promise.resolve(null);
			}
			throw new Error("Unexpected error");
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
	params: z.infer<typeof editTaskSchema.params>,
	body: z.infer<typeof editTaskSchema.body>,
) =>
	({
		params,
		body,
		server: {
			db: {},
			queue: {
				getQueue: vi.fn().mockReturnValue({
					getJob: vi.fn().mockResolvedValue(null),
				}),
			},
			log: {
				error: vi.fn(),
				info: vi.fn(),
				debug: vi.fn(),
				warn: vi.fn(),
			},
		},
		userData: { id: "user-1" },
		log: {
			error: vi.fn(),
			info: vi.fn(),
			debug: vi.fn(),
			warn: vi.fn(),
		},
	}) as unknown as FastifyRequest<{
		Params: z.infer<typeof editTaskSchema.params>;
		Body: z.infer<typeof editTaskSchema.body>;
	}>;

const mockReply = () => {
	const res = {} as FastifyReply;
	res.status = vi.fn().mockReturnValue(res);
	res.send = vi.fn().mockReturnValue(res);
	return res;
};

describe("editTaskHandler", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should update a task successfully", async () => {
		const req = mockRequest({ taskId: "task123" }, { title: "Updated Task" });
		const res = mockReply();

		await editTaskHandler(req, res);

		expect(res.send).toHaveBeenCalledWith({
			message: "Task with id task123 updated successfully",
			task: expect.objectContaining({
				title: "Updated Task",
			}),
		});
	});

	it("should return 404 if task not found", async () => {
		const req = mockRequest({ taskId: "not-found" }, { title: "Updated Task" });
		const res = mockReply();

		await editTaskHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.send).toHaveBeenCalledWith({
			cause: "Task not found",
			message: "Failed to update task",
			metadata: undefined,
		});
	});

	it("should handle errors gracefully", async () => {
		const req = mockRequest({ taskId: "error" }, { title: "Updated Task" });
		const res = mockReply();

		await editTaskHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith({
			cause: "Unexpected error",
			message: "Failed to update task",
			metadata: undefined,
		});
	});
});
