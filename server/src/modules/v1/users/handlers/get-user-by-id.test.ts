import type { FastifyReply, FastifyRequest } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { z } from "zod";
import { getUserByIdHandler } from "./get-user-by-id.js";
import type { getUserByIdSchema } from "./get-user-by-id.js";

vi.mock("@/modules/v1/users/users.service.js", () => ({
	createUserService: () => ({
		getUserById: vi.fn((userId) => {
			if (userId === "user123") {
				return Promise.resolve({
					id: "user123",
					name: "John Doe",
					email: "john@example.com",
				});
			}
			if (userId === "not-found") {
				return Promise.resolve(null);
			}
			throw new Error("Unexpected error");
		}),
	}),
}));

const mockRequest = (params: z.infer<typeof getUserByIdSchema.params>) => {
	const req = {
		params,
		server: { db: {} },
		log: {
			info: vi.fn(),
			error: vi.fn(),
			debug: vi.fn(),
			warn: vi.fn(),
		},
	};
	return req as unknown as FastifyRequest<{
		Params: z.infer<typeof getUserByIdSchema.params>;
	}>;
};

const mockReply = () => {
	const res = {} as FastifyReply;
	res.status = vi.fn().mockReturnValue(res);
	res.send = vi.fn().mockReturnValue(res);
	return res;
};

describe("getUserByIdHandler", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should fetch user successfully", async () => {
		const req = mockRequest({ userId: "user123" });
		const res = mockReply();

		await getUserByIdHandler(req, res);

		expect(res.send).toHaveBeenCalledWith({
			user: expect.objectContaining({
				id: "user123",
				name: "John Doe",
			}),
		});
	});

	it("should return 404 if user not found", async () => {
		const req = mockRequest({ userId: "not-found" });
		const res = mockReply();

		await getUserByIdHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.send).toHaveBeenCalledWith({
			message: "Failed to fetch user",
			cause: "User not found",
			metadata: undefined,
		});
	});

	it("should handle errors gracefully", async () => {
		const req = mockRequest({ userId: "error" });
		const res = mockReply();

		await getUserByIdHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith({
			message: "Failed to fetch user",
			cause: "Unexpected error",
			metadata: undefined,
		});
	});
});
