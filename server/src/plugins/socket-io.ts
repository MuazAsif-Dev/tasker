import type { FastifyInstance, FastifyPluginAsync } from "fastify";
import fp from "fastify-plugin";
import { Server, type ServerOptions } from "socket.io";

export type FastifySocketioOptions = Partial<ServerOptions> & {
	preClose?: (done: () => void) => void;
};

const fastifySocketIO: FastifyPluginAsync<FastifySocketioOptions> = fp(
	async (fastify, opts: FastifySocketioOptions) => {
		function defaultPreClose(done: () => void) {
			(fastify as FastifyInstance).io.local.disconnectSockets(true);
			done();
		}
		fastify.decorate("io", new Server(fastify.server, opts));
		fastify.addHook("preClose", (done) => {
			if (opts.preClose) {
				return opts.preClose(done);
			}
			return defaultPreClose(done);
		});
		fastify.addHook("onClose", (fastify: FastifyInstance, done) => {
			(fastify as FastifyInstance).io.close();
			done();
		});

		fastify.ready().then(() => {
			fastify.io.use((socket, next) => {
				const token =
					socket.handshake.auth.token || socket.handshake.headers.token;

				if (!token) {
					return next(new Error("Authentication error"));
				}

				try {
					const decoded = fastify.jwt.verify(token);
					socket.data.user = decoded;
					next();
				} catch (error) {
					next(new Error("Authentication error"));
				}
			});

			fastify.io.on("connection", (socket) => {
				fastify.log.debug("client connected");
				socket.join(socket.data.user.id);
				socket.on("disconnect", () => {
					fastify.log.debug("client disconnected");
				});
			});
		});
	},
	{ name: "fastify-socket.io" },
);

export default fastifySocketIO;
