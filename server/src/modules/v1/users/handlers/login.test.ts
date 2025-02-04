import type { FastifyReply, FastifyRequest } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { z } from "zod";
import { loginHandler } from "./login.js";
import type { loginUserSchema } from "./login.js";

vi.mock("@/modules/v1/users/users.service.js", () => ({
	createUserService: () => ({
		getUserByEmail: vi.fn((email) => {
			if (email === "john@example.com") {
				return Promise.resolve({
					id: "user123",
					email: "john@example.com",
					password: "hashedpassword",
				});
			}
			if (email === "not-found@example.com") {
				return Promise.resolve(null);
			}
			if (email === "error@example.com") {
				throw new Error("Unexpected error");
			}
			return Promise.resolve(null);
		}),
	}),
}));

vi.mock("argon2", () => ({
	default: {
		verify: vi.fn((hashedPassword, password) => {
			if (password === "correctpassword") {
				return Promise.resolve(true);
			}
			return Promise.resolve(false);
		}),
	},
}));

const mockRequest = (body: z.infer<typeof loginUserSchema.body>) =>
	({
		body,
		server: { db: {}, jwt: { sign: vi.fn().mockReturnValue("token") } },
		log: {
			info: vi.fn(),
			error: vi.fn(),
			debug: vi.fn(),
			warn: vi.fn(),
		},
	}) as unknown as FastifyRequest<{
		Body: z.infer<typeof loginUserSchema.body>;
	}>;

const mockReply = () => {
	const res = {} as FastifyReply;
	res.status = vi.fn().mockReturnValue(res);
	res.send = vi.fn().mockReturnValue(res);
	return res;
};

describe("loginHandler", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should login successfully", async () => {
		const req = mockRequest({
			email: "john@example.com",
			password: "correctpassword",
		});
		const res = mockReply();

		await loginHandler(req, res);

		expect(res.send).toHaveBeenCalledWith({ token: "token" });
	});

	it("should return 404 if user not found", async () => {
		const req = mockRequest({
			email: "not-found@example.com",
			password: "correctpassword",
		});
		const res = mockReply();

		await loginHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(404);
		expect(res.send).toHaveBeenCalledWith({
			message: "Failed to login",
			cause: "User not found",
			metadata: undefined,
		});
	});

	it("should return 401 if password is invalid", async () => {
		const req = mockRequest({
			email: "john@example.com",
			password: "wrongpassword",
		});
		const res = mockReply();

		await loginHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(401);
		expect(res.send).toHaveBeenCalledWith({
			message: "Failed to login",
			cause: "Invalid password",
			metadata: undefined,
		});
	});

	it("should handle errors gracefully", async () => {
		const req = mockRequest({
			email: "error@example.com",
			password: "correctpassword",
		});
		const res = mockReply();

		await loginHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith({
			message: "Failed to login",
			cause: "Unexpected error",
			metadata: undefined,
		});
	});
});
