import { FastifySchemaWithDocs } from "@/types/fastify/FastifySchemaWithDocs";

export const PingRoute: FastifySchemaWithDocs = {
	description: "Ping the API to see if it is working.",
	tags: ["developer"],
	response: {
		200: {
			description: "Successful Pong 🏓",
			type: "object",
			properties: {
				success: {
					type: "string",
					description: "Success Message",
				},
				message: {
					type: "string",
					description: "A Human-readable message from the server.",
				},
				serverTime: {
					type: "number",
					message: "Time on the server.",
				},
				echo: {
					type: "string",
					message:
						"An optional message that could be passed through to the ping.",
				},
			},
		},
	},
	security: [{ bearerAuth: [] }],
};
