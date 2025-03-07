import { FastifyPluginAsync } from "fastify";
import "dotenv/config";
import { GatewayError } from "@/errors";
import pool from "@/db";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";

interface AuthenticateRequest {
	command: string;
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
						command: { type: "string" },
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
				const { command, actor, expirationTime = 5 } = request.body;

				if (!command || !actor) {
					const error = new GatewayError(`Missing required parameters. Both 'command' and 'actor' must be provided.`);
					error.statusCode = 400;
					throw error;
				}

				const jose = await import("jose");
				const jti = uuidv4();

				const signingSecret = new TextEncoder().encode(
					process.env.JWT_SECRET
				);

				const signedJWT = await new jose.SignJWT({
					command,
					actor,
				})
					.setProtectedHeader({ alg: "HS256" })
					.setIssuedAt()
					.setExpirationTime(`${expirationTime}m`)
					.setJti(jti)
					.sign(signingSecret);

				await pool.query(
					`INSERT INTO jwt (jti) VALUES (UUID_TO_BIN(?))`,
					[jti]
				);

				const encryptionKey = await jose.importJWK(
					JSON.parse(process.env.JWT_ENCRYPTION_KEY || '{}'),
					'A256GCM'
				);

				const encryptedJWT = await new jose.CompactEncrypt(
					new TextEncoder().encode(signedJWT)
				)
					.setProtectedHeader({ alg: "dir", enc: "A256GCM" })
					.encrypt(encryptionKey);

				return reply.code(201).send({
					message: "JWT was successfully created.",
					encryptedJWT
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
