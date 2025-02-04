import { createUserService } from "@/modules/v1/users/users.service.js";
import type { FastifyReply, FastifyRequest } from "fastify";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { z } from "zod";
import { googleLoginHandler } from "./google-login.js";
import type { googleLoginUserSchema } from "./google-login.js";

vi.mock("google-auth-library", () => ({
	OAuth2Client: vi.fn(() => ({
		verifyIdToken: vi.fn().mockImplementation(({ idToken }) => {
			if (idToken === "valid-token") {
				return Promise.resolve({
					getPayload: () => ({
						email: "test@example.com",
						name: "Test User",
						sub: "google-123",
					}),
				});
			}
			if (idToken === "invalid-payload") {
				return Promise.resolve({
					getPayload: () => null,
				});
			}
			return Promise.reject(new Error("Invalid token"));
		}),
	})),
}));

vi.mock("@/modules/v1/users/users.service.js", () => ({
	createUserService: vi.fn(() => ({
		getUserByEmail: vi.fn((email) => {
			if (email === "existing@example.com") {
				return Promise.resolve({
					id: "user123",
					email: "existing@example.com",
				});
			}
			return Promise.resolve(null);
		}),
		createUser: vi.fn((userData) => {
			if (userData.email === "test@example.com") {
				return Promise.resolve({
					id: "new-user-123",
					email: userData.email,
				});
			}
			return Promise.resolve(null);
		}),
		getUserById: vi.fn().mockResolvedValue(undefined),
		updateFcmToken: vi.fn().mockResolvedValue({
			id: "user123",
			email: "existing@example.com",
		}),
	})),
}));

const mockRequest = (body: z.infer<typeof googleLoginUserSchema.body>) =>
	({
		body,
		server: {
			db: {},
			jwt: {
				sign: vi.fn().mockReturnValue("signed-jwt-token"),
			},
			log: {
				error: vi.fn(),
				info: vi.fn(),
				debug: vi.fn(),
			},
		},
		log: {
			error: vi.fn(),
			info: vi.fn(),
			debug: vi.fn(),
		},
	}) as unknown as FastifyRequest<{
		Body: z.infer<typeof googleLoginUserSchema.body>;
	}>;

const mockReply = () => {
	const res = {} as FastifyReply;
	res.status = vi.fn().mockReturnValue(res);
	res.send = vi.fn().mockReturnValue(res);
	return res;
};

describe("googleLoginHandler", () => {
	afterEach(() => {
		vi.clearAllMocks();
	});

	it("should login existing user successfully", async () => {
		const req = mockRequest({ token: "valid-token" });
		const res = mockReply();

		vi.mocked(createUserService).mockImplementation(() => ({
			getUserByEmail: vi.fn().mockResolvedValue({
				id: "user123",
				email: "existing@example.com",
			}),
			createUser: vi.fn(),
			getUserById: vi.fn().mockResolvedValue(undefined),
			updateFcmToken: vi.fn().mockResolvedValue({
				id: "user123",
				email: "existing@example.com",
			}),
		}));

		await googleLoginHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith({
			token: "signed-jwt-token",
		});
	});

	it("should create new user and login successfully", async () => {
		const req = mockRequest({ token: "valid-token" });
		const res = mockReply();

		await googleLoginHandler(req, res);

		expect(res.status).toHaveBeenCalledWith(200);
		expect(res.send).toHaveBeenCalledWith({
			token: "signed-jwt-token",
		});
	});

	it("should handle invalid token payload", async () => {
		const req = mockRequest({ token: "invalid-payload" });
		const res = mockReply();

		await googleLoginHandler(req, res);

		expect(res.send).toHaveBeenCalledWith({
			message: "Failed to login",
			cause: "Invalid token payload",
			metadata: undefined,
		});
	});

	it("should handle invalid token", async () => {
		const req = mockRequest({ token: "invalid-token" });
		const res = mockReply();

		await googleLoginHandler(req, res);

		expect(res.send).toHaveBeenCalledWith({
			message: "Failed to login",
			cause: "Invalid token",
			metadata: undefined,
		});
	});

	it("should handle user creation failure", async () => {
		const req = mockRequest({ token: "valid-token" });
		const res = mockReply();

		vi.mocked(createUserService).mockImplementation(() => ({
			getUserByEmail: vi.fn().mockResolvedValue(null),
			createUser: vi.fn().mockResolvedValue(null),
			getUserById: vi.fn().mockResolvedValue(undefined),
			updateFcmToken: vi.fn().mockResolvedValue(null),
		}));

		await googleLoginHandler(req, res);

		expect(res.send).toHaveBeenCalledWith({
			message: "Failed to create user",
			cause: "Failed to create user",
			metadata: undefined,
		});
	});
});
