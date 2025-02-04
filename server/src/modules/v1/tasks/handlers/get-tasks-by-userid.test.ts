import type { FastifyReply, FastifyRequest } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { z } from "zod";
import { getTasksByUserIdHandler } from "./get-tasks-by-userid.js";
import type { getTasksByUserIdSchema } from "./get-tasks-by-userid.js";

vi.mock("@/modules/v1/tasks/tasks.service.js", () => ({
	createTaskservice: () => ({
		getTasksByUserId: vi.fn((userId, cursor, pageSize) => {
			if (userId === "user123") {
				return Promise.resolve([
					{ id: "task1", title: "Task 1", createdAt: new Date() },
					{ id: "task2", title: "Task 2", createdAt: new Date() },
				]);
			}
			if (userId === "not-found") {
				return Promise.resolve(null);
			}
			throw new Error("Unexpected error");
		}),
	}),
}));

const mockLogger = {
	error: vi.fn(),
	info: vi.fn(),
	debug: vi.fn(),
	warn: vi.fn(),
	child: vi.fn(),
	level: "info",
	fatal: vi.fn(),
	trace: vi.fn(),
	silent: vi.fn(),
};

type RequestType = FastifyRequest<{
	Querystring: z.infer<typeof getTasksByUserIdSchema.querystring>;
}>;

const mockRequest = (
	query: z.infer<typeof getTasksByUserIdSchema.querystring>,
	userId: string,
) => {
	return {
		query,
		userData: { id: userId },
		server: { db: {} },
		log: mockLogger,
	} as unknown as RequestType;
};

const mockReply = () => {
	const res = {} as FastifyReply;
	res.status = vi.fn().mockReturnValue(res);
	res.send = vi.fn().mockReturnValue(res);
	return res;
};

describe("getTasksByUserIdHandler", () => {
	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
	});

	it("should fetch tasks successfully", async () => {
		const req = mockRequest(
			{
				cursor: { id: "task1", createdAt: new Date().toISOString() },
				pageSize: 10,
			},
			"user123",
		);
		const res = mockReply();

		await getTasksByUserIdHandler(req, res);

		expect(res.send).toHaveBeenCalledWith({
			message: "Tasks with userId user123 fetched successfully",
			tasks: expect.arrayContaining([
				expect.objectContaining({ title: "Task 1" }),
				expect.objectContaining({ title: "Task 2" }),
			]),
		});
	});

	it("should return 404 if tasks not found", async () => {
		const req = mockRequest(
			{
				cursor: { id: "task1", createdAt: new Date().toISOString() },
				pageSize: 10,
			},
			"not-found",
		);
		const res = mockReply();

		await getTasksByUserIdHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.send).toHaveBeenCalledWith({
			cause: "Tasks not found",
			message: "Failed to fetch tasks",
			metadata: undefined,
		});
	});

	it("should handle errors gracefully", async () => {
		const req = mockRequest(
			{
				cursor: { id: "task1", createdAt: new Date().toISOString() },
				pageSize: 10,
			},
			"error",
		);
		const res = mockReply();

		await getTasksByUserIdHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith({
			cause: "Unexpected error",
			message: "Failed to fetch tasks",
			metadata: undefined,
		});
	});
});
