import type { FastifyReply, FastifyRequest } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { z } from "zod";
import { signupHandler } from "./signup.js";
import type { signupUserSchema } from "./signup.js";

vi.mock("@/modules/v1/users/users.service.js", () => ({
	createUserService: () => ({
		getUserByEmail: vi.fn((email) => {
			if (email === "existing@example.com") {
				return Promise.resolve({ id: "existing", email });
			}
			if (email === "error@example.com") {
				throw new Error("Database error");
			}
			return Promise.resolve(null);
		}),
		createUser: vi.fn((user) => {
			return Promise.resolve({
				id: "user123",
				name: user.name,
				email: user.email,
			});
		}),
	}),
}));

vi.mock("argon2", () => ({
	default: {
		hash: vi.fn((password) => Promise.resolve(`hashed-${password}`)),
	},
}));

const mockRequest = (body: z.infer<typeof signupUserSchema.body>) =>
	({
		body,
		server: { db: {} },
		log: {
			info: vi.fn(),
			error: vi.fn(),
			debug: vi.fn(),
			warn: vi.fn(),
		},
	}) as unknown as FastifyRequest<{
		Body: z.infer<typeof signupUserSchema.body>;
	}>;

const mockReply = () => {
	const res = {} as FastifyReply;
	res.status = vi.fn().mockReturnValue(res);
	res.send = vi.fn().mockReturnValue(res);
	return res;
};

describe("signupHandler", () => {
	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("should signup successfully", async () => {
		const req = mockRequest({
			name: "John Doe",
			email: "john@example.com",
			password: "password",
		});
		const res = mockReply();

		await signupHandler(req, res);

		expect(res.send).toHaveBeenCalledWith({
			message: "User created successfully",
		});
	});

	it("should return 400 if user already exists", async () => {
		const req = mockRequest({
			name: "John Doe",
			email: "existing@example.com",
			password: "password",
		});
		const res = mockReply();

		await signupHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(400);
		expect(res.send).toHaveBeenCalledWith({
			message: "Failed to signup",
			cause: "User already exists",
			metadata: undefined,
		});
	});

	it("should handle errors gracefully", async () => {
		const req = mockRequest({
			name: "John Doe",
			email: "error@example.com",
			password: "password",
		});
		const res = mockReply();

		await signupHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(500);
		expect(res.send).toHaveBeenCalledWith({
			message: "Failed to signup",
			cause: "Database error",
			metadata: undefined,
		});
	});
});
