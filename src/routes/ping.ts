import { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";

interface PingResponse {
	success: boolean;
	message: string;
	serverTime: number;
	echo?: string;
}

const ping: FastifyPluginAsync = async (fastify) => {
	fastify.get<{
		Querystring: Record<string, never>;
		Params: Record<string, never>;
		Headers: Record<string, never>;
		Reply: PingResponse;
	}>("/ping", async (request: FastifyRequest, reply: FastifyReply) => {
		return reply.code(200).send({
			message: "Pong!",
			serverTime: new Date(),
			echo: "Hello World, Pong!",
		});
	});
};

export default ping;
