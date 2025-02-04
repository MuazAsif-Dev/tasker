import type { FastifyReply, FastifyRequest } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import { getOwnUserDataHandler } from "./get-own-user-data.js";

vi.mock("@/modules/v1/users/users.service.js", () => ({
	createUserService: () => ({
		getUserById: vi.fn().mockImplementation((id) => {
			if (id === "user-1") {
				return Promise.resolve({
					id: "user-1",
					email: "test@example.com",
					name: "Test User",
				});
			}
			if (id === "not-found") {
				return Promise.resolve(null);
			}
			throw new Error("Database error");
		}),
	}),
}));

const mockRequest = (userId: string) =>
	({
		userData: { id: userId },
		server: {
			db: {},
		},
		log: {
			info: vi.fn(),
			error: vi.fn(),
			debug: vi.fn(),
			warn: vi.fn(),
		},
	}) as unknown as FastifyRequest;

const mockReply = () => {
	const res = {} as FastifyReply;
	res.status = vi.fn().mockReturnValue(res);
	res.send = vi.fn().mockReturnValue(res);
	return res;
};

describe("getOwnUserDataHandler", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should fetch user data successfully", async () => {
		const req = mockRequest("user-1");
		const res = mockReply();

		await getOwnUserDataHandler(req, res);

		expect(res.send).toHaveBeenCalledWith({
			user: expect.objectContaining({
				id: "user-1",
				email: "test@example.com",
				name: "Test User",
			}),
		});
	});

	it("should return 404 if user not found", async () => {
		const req = mockRequest("not-found");
		const res = mockReply();

		await getOwnUserDataHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.send).toHaveBeenCalledWith({
			message: "Failed to fetch user",
			cause: "User not found",
			metadata: undefined,
		});
	});

	it("should handle errors gracefully", async () => {
		const req = mockRequest("error-user");
		const res = mockReply();

		await getOwnUserDataHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith({
			message: "Failed to fetch user",
			cause: "Database error",
			metadata: undefined,
		});
	});
});
