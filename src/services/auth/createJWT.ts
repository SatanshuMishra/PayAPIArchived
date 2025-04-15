import "dotenv/config";
import { GatewayError } from "@/errors";
import pool from "@/db";
import { v4 as uuidv4 } from "uuid";
import { verifyApiKey } from "@/scripts/apiKey";
import getBearerToken from "@/scripts/getBearerToken";

export default async function createJWT(
	apiKeyHeader: string,
	command: number,
	actor: string,
	expirationTime = 5
) {
	try {
		const apiKey = getBearerToken(apiKeyHeader);
		if (!apiKey || !command || !actor) {
			const error = new GatewayError(
				`Missing required parameters. 'apiKey', 'command' and 'actor' must be provided.`
			);
			error.statusCode = 400;
			throw error;
		}

		const isApiKeyValid = await verifyApiKey(apiKey, command);

		if (!isApiKeyValid) {
			const error = new GatewayError(
				`API Key doesn't have sufficient permissions to process this request.`
			);
			error.statusCode = 401;
			throw error;
		}

		const jose = await import("jose");
		const jti = uuidv4();

		const signingSecret = new TextEncoder().encode(process.env.JWT_SECRET);

		const signedJWT = await new jose.SignJWT({
			apiKey,
			command,
			actor,
		})
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime(`${expirationTime}m`)
			.setJti(jti)
			.sign(signingSecret);

		await pool.query(`INSERT INTO jwt (jti) VALUES (UUID_TO_BIN(?))`, [
			jti,
		]);

		const encryptionKey = await jose.importJWK(
			JSON.parse(process.env.JWT_ENCRYPTION_KEY || "{}"),
			"A256GCM"
		);

		const encryptedJWT = await new jose.CompactEncrypt(
			new TextEncoder().encode(signedJWT)
		)
			.setProtectedHeader({ alg: "dir", enc: "A256GCM" })
			.encrypt(encryptionKey);

		return encryptedJWT;
	} catch (err) {
		if (err instanceof GatewayError) {
			throw err;
		}

		const error = new GatewayError(`Internal Server Error`);
		error.statusCode = 500;
		throw error;
	}
}
