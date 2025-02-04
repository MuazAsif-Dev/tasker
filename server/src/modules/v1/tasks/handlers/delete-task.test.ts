import type { FastifyReply, FastifyRequest } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { z } from "zod";
import { deleteTaskHandler } from "./delete-task.js";
import type { deleteTaskSchema } from "./delete-task.js";

vi.mock("@/modules/v1/tasks/tasks.service.js", () => ({
	createTaskservice: vi.fn(() => ({
		deleteTask: vi.fn((id) => {
			if (id === "task123") {
				return Promise.resolve({ deletedId: id });
			}
			if (id === "not-found") {
				return Promise.resolve(null);
			}
			if (id === "error") {
				return Promise.reject(
					new Error("Cannot read properties of undefined (reading 'id')"),
				);
			}
			return Promise.reject(new Error("Unexpected error"));
		}),
	})),
}));

const mockRequest = (params: z.infer<typeof deleteTaskSchema.params>) =>
	({
		params,
		server: {
			db: {},
			log: {
				error: vi.fn(),
				info: vi.fn(),
				debug: vi.fn(),
				warn: vi.fn(),
			},
			queue: {
				getQueue: vi.fn().mockReturnValue({
					getJobs: vi.fn().mockResolvedValue([]),
				}),
			},
			kv: {
				publisher: {
					publish: vi.fn(),
				},
			},
		},
		log: {
			error: vi.fn(),
			info: vi.fn(),
			debug: vi.fn(),
			warn: vi.fn(),
		},
		userData: {
			id: "user123",
		},
	}) as unknown as FastifyRequest<{
		Params: z.infer<typeof deleteTaskSchema.params>;
	}>;

const mockReply = () => {
	const res = {} as FastifyReply;
	res.status = vi.fn().mockReturnValue(res);
	res.send = vi.fn().mockReturnValue(res);
	return res;
};

describe("deleteTaskHandler", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should delete a task successfully", async () => {
		const req = mockRequest({ taskId: "task123" });
		const res = mockReply();

		await deleteTaskHandler(req, res);

		expect(res.send).toHaveBeenCalledWith({
			message: "Task with id task123 deleted successfully",
		});
	});

	it("should return 404 if task not found", async () => {
		const req = mockRequest({ taskId: "not-found" });
		const res = mockReply();

		await deleteTaskHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.send).toHaveBeenCalledWith({
			cause: "Task not found",
			message: "Failed to delete task",
			metadata: undefined,
		});
	});

	it("should handle errors gracefully", async () => {
		const req = mockRequest({ taskId: "error" });
		const res = mockReply();

		await deleteTaskHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith({
			cause: "Cannot read properties of undefined (reading 'id')",
			message: "Failed to delete task",
			metadata: undefined,
		});
	});
});
