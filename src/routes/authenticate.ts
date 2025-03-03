import { FastifyPluginAsync } from "fastify";
import { v4 as uuid } from "uuid";
import "dotenv/config";
import pool from "@/db";

async function createEncryptedJWT(
	customerID: string,
	command: string,
	expirationTime: number
) {
	const jose = await import("jose");
	const jti = uuid();

	const signingSecret = new TextEncoder().encode(process.env.JWT_SECRET);
	const alg = "HS256";

	const signedJWT = await new jose.SignJWT({
		customerID,
		command,
	})
		.setProtectedHeader({ alg })
		.setIssuedAt()
		.setExpirationTime(`${expirationTime}m`)
		.setJti(jti)
		.sign(signingSecret);

	try {
		await pool.query(
			`INSERT INTO jwt (jti) VALUES (?)`,
			[jti]
		);
	} catch (dbError) {
		console.error("Database error:", dbError);
		throw new Error(`Database error: ${dbError.message}`);
	}

	// Import the JWK
	const encryptionKey = await jose.importJWK(
		JSON.parse(process.env.JWT_ENCRYPTION_KEY || '{}'),
		'A256GCM' // Specify the algorithm
	);

	// Encrypt with the JWK
	const encryptedJWT = await new jose.CompactEncrypt(
		new TextEncoder().encode(signedJWT)
	)
		.setProtectedHeader({ alg: "dir", enc: "A256GCM" })
		.encrypt(encryptionKey);

	return encryptedJWT;
}

interface AuthenticateRequest {
	command: string;
	customerID: string;
	expirationTime?: number; // WILL BE SET TO 5m BY DEFAULT.
}

interface AuthenticateResponse {
	success: boolean;
	jwt: string;
}

interface ErrorResponse {
	error: string;
}

const authenticate: FastifyPluginAsync = async (fastify) => {
	fastify.post<{
		Body: AuthenticateRequest;
		Reply: AuthenticateResponse | ErrorResponse;
	}>(
		"/authenticate",
		{
			schema: {
				body: {
					type: "object",
					properties: {
						command: { type: "string" },
						customerID: { type: "string" },
						expirationTime: {
							type: "number",
							default: 5,
						},
					},
					required: ["command", "customerID"],
				},
				response: {
					200: {
						type: "object",
						properties: {
							success: { type: "boolean" },
							jwt: { type: "string" },
						},
					},
					500: {
						type: "object",
						properties: {
							error: { type: "string" },
						},
					},
				},
			},
		},
		async (request, reply) => {
			try {
				const {
					customerID,
					command,
					expirationTime = 5,
				} = request.body;

				const encryptedJWT = await createEncryptedJWT(
					customerID,
					command,
					expirationTime
				);
				console.log("Encrypted JWT (sign-then-encrypt):", encryptedJWT);

				return { success: true, jwt: encryptedJWT };
			} catch (error) {
				console.error("JWT generation error:", error);
				return reply.code(500).send({
					error: "Failed to generate token",
				} as ErrorResponse);
			}
		}
	);
};

export default authenticate;
