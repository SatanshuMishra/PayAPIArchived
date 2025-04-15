import { FastifyPluginAsync } from "fastify";
import "dotenv/config";
import { GatewayError } from "@/errors";
import createJWT from "@/services/auth/createJWT";

interface AuthenticateRequest {
	command: number;
	actor: string;
	expirationTime?: number; // WILL BE SET TO 5m BY DEFAULT.
}

interface AuthenticateResponse {
	message: string;
	encryptedJWT: string;
}

interface ErrorResponse { }

const createToken: FastifyPluginAsync = async (fastify) => {
	fastify.post<{
		Body: AuthenticateRequest;
		Reply: AuthenticateResponse | ErrorResponse;
	}>(
		"/auth/tokens",
		{
			schema: {
				body: {
					type: "object",
					properties: {
						command: { type: "number" },
						actor: { type: "string" },
						expirationTime: {
							type: "number",
							default: 5,
						},
					},
					required: ["command", "actor"],
				},
				response: {
					200: {
						type: "object",
						properties: {
							message: { type: "string" },
							encryptedJwt: { type: "string" },
						},
					},
					400: {
						type: "object",
						properties: {},
					},
					500: {
						type: "object",
						properties: {},
					},
				},
			},
		},
		async (request, reply) => {
			try {
				const apiKey: string | undefined =
					request.headers.authorization;
				const { command, actor, expirationTime = 5 } = request.body;

				if (!apiKey || !command || !actor) {
					const error = new GatewayError(
						`Missing required parameters. Both 'command' and 'actor' must be provided.`
					);
					error.statusCode = 400;
					throw error;
				}

				const encryptedJWT = await createJWT(
					apiKey,
					command,
					actor,
					expirationTime
				);
				return reply.code(201).send({
					message: "JWT was successfully created.",
					encryptedJWT,
				});
			} catch (err) {
				if (err instanceof GatewayError) {
					throw err;
				}

				const error = new GatewayError(`Internal Server Error`);
				error.statusCode = 500;
				throw error;
			}
		}
	);
};

export default createToken;
