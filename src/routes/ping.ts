import { FastifyPluginAsync } from "fastify";

interface PingRequest {
	timestamp: number;
	message?: string;
}

interface PingResponse {
	success: boolean;
	message: string;
	receivedAt: number;
	serverTime: number;
	echo?: string;
}

const ping: FastifyPluginAsync = async (fastify) => {
	fastify.post<{
		Body: PingRequest;
		Reply: PingResponse;
	}>("/ping", async (request) => {
		const { timestamp, message } = request.body;

		return {
			success: true,
			message: "Pong!",
			receivedAt: timestamp,
			serverTime: Date.now(),
			echo: message,
		};
	});
};

export default ping;
