import { FastifyPluginAsync } from "fastify";
import "dotenv/config";
import pool from "@/db";
import { v4 as uuidv4 } from 'uuid';
import CryptoJS from "crypto-js";

async function createEncryptedJWT(
	command: string,
	actor: string,
	clientContext: {
		ip: string;
		fingerprint: string;
	},
	expirationTime?: number
) {
	const jose = await import("jose");
	const jti = uuidv4();

	const signingSecret = new TextEncoder().encode(process.env.JWT_SECRET);
	const alg = "HS256";

	const signedJWT = await new jose.SignJWT({
		customerID,
		command,
		actor
	})
		.setProtectedHeader({ alg })
		.setIssuedAt()
		.setExpirationTime(`${expirationTime}m`)
		.setJti(jti)
		.sign(signingSecret);

	try {
		await pool.query(
			`INSERT INTO jwt (jti) VALUES (UUID_TO_BIN(?))`,
			[jti]
		);
	} catch (dbError) {
		console.error("Database error:", dbError);
		throw new Error(`Database error: ${dbError.message}`);
	}

	const encryptionKey = await jose.importJWK(
		JSON.parse(process.env.JWT_ENCRYPTION_KEY || '{}'),
		'A256GCM'
	);

	const encryptedJWT = await new jose.CompactEncrypt(
		new TextEncoder().encode(signedJWT)
	)
		.setProtectedHeader({ alg: "dir", enc: "A256GCM" })
		.encrypt(encryptionKey);

	const logID = uuidv4();

	await pool.query(`INSERT INTO jwt_log_events (id, event_type, success, reason, ip, browser_fingerprint, actor_id) VALUES (UUID_TO_BIN(?), ?, ?, ?, INET6_ATON(?), ?, UUID_TO_BIN(?))`, [
		logID,
		0,
		1,
		"LOG WAS GENERATED SUCCESSFULLY. AUTO-GENERATED.",
		clientContext.ip,
		clientContext.fingerprint,
		actor
	]);

	await pool.query(
		`INSERT INTO jwt_log_details (log_id, jti, command, customer_email) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?, ?)`, [
		logID,
		jti,
		0, // DYNAMICALLY FETCH THIS
		customerID.replace(/([a-zA-Z])[^@]*([a-zA-Z])(@.+)/, '$1*****$2$3')
	]
	)

	return encryptedJWT;
}

interface AuthenticateRequest {
	command: string;
	customerID: string;
	actor: string;
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
					400: {
						type: "object",
						properties: {
							error: { type: "string" },
						}
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
					actor,
					expirationTime = 5,
				} = request.body;

				const ip = request.ip || request.connection.remoteAddress;

				const userAgent = request.headers['user-agent'] || '';
				const acceptLanguage = request.headers['accept-language'] || '';
				const acceptEncoding = request.headers['accept-encoding'] || '';

				const fingerprint = CryptoJS.SHA256(`${userAgent}${acceptLanguage}${acceptEncoding}`).toString(CryptoJS.enc.Hex);

				const clientContext = {
					ip,
					fingerprint
				};

				const logID = uuidv4();


				// CHECK ALL REQUIRED VALUES ARE PRESENT
				if (!customerID || !command || !actor) {
					await pool.query(`INSERT INTO jwt_log_events (id, event_type, success, reason, ip, browser_fingerprint, actor_id) VALUES (UUID_TO_BIN(?), ?, ?, ?, INET6_ATON(?), ?, UUID_TO_BIN(?))`, [
						logID,
						0,
						0,
						"MISSING REQUIRED PARAMETERS",
						clientContext.ip,
						clientContext.fingerprint,
						actor
					]);
					return reply.code(400).send({
						error: "MISSING REQUIRED PARAMETERS",
					} as ErrorResponse);
				}

				const encryptedJWT = await createEncryptedJWT(
					customerID,
					command,
					actor,
					clientContext,
					expirationTime
				);

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
