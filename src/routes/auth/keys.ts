import { FastifyPluginAsync } from "fastify";
import "dotenv/config";
import { GatewayError } from "@/errors";
import createKey from "@/services/auth/createKey";

interface AuthenticateRequest {
	name: string;
	roleID: number;
	expirationTime?: number;
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
		"/auth/keys",
		{
			schema: {
				body: {
					type: "object",
					properties: {
						name: { type: "string" },
						roleID: { type: "number" },
						expirationTime: {
							type: "number",
							default: 43800, // Defaults to 1 Month
						},
					},
					required: ["roleID"],
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
				const { name, roleID, expirationTime = 43800 } = request.body;

				if (!roleID) {
					const error = new GatewayError(
						`Missing required parameters. 'roleID' must be provided.`
					);
					error.statusCode = 400;
					throw error;
				}

				const apiKey = await createKey(name, roleID, expirationTime);

				return reply.code(201).send({
					message: "JWT was successfully created.",
					apiKey,
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
