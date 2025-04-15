import 'fastify';

declare module 'fastify' {
	interface FastifyRequest {
		clientContext: {
			ip: string;
			fingerprint: string;
		};
	}
}
