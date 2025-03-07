import "dotenv/config";
import pool from "@/db";
import { v4 as uuidv4 } from 'uuid';

export default async function verifyJWT(
	token: string,
	action: number,
	clientContext: {
		ip: string;
		fingerprint: string;
	}
): Promise<string> {

	console.log(`ENTERED VERIFY JWT SCRIPT`);
	const jose = await import("jose");

	// WILL BE USED TO GENERATE LOG AND IT'S DETAILS
	const logID = uuidv4();

	let jti = null;
	let command = null;

	try {
		await pool.query(
			`INSERT INTO jwt_log_events (
        id, event_type, success, ip, browser_fingerprint, actor_id
      ) VALUES (
        UUID_TO_BIN(?), ?, ?, INET6_ATON(?), ?, NULL
      )`,
			[
				logID,
				0,
				0,
				clientContext.ip,
				clientContext.fingerprint,
			]
		);

		// DECRYPT TOKEN
		const decryptionKey = await jose.importJWK(
			JSON.parse(process.env.JWT_ENCRYPTION_KEY || "{}")
		);

		const { plaintext } = await jose.compactDecrypt(token, decryptionKey);
		const jwt = new TextDecoder().decode(plaintext);

		console.log(`JWT: `, jwt);

		// VALIDATE JWT SIGNATURE
		const {
			payload,
		}: {
			payload: {
				customerID: string;
				command: string;
				jti: string;
			};
		} = await jose.jwtVerify(
			jwt,
			new TextEncoder().encode(process.env.JWT_SECRET)
		);

		await pool.query(
			`INSERT INTO jwt_log_details (
        log_id, jti, command, customer_email
      ) VALUES (
        UUID_TO_BIN(?), UUID_TO_BIN(?), ?, ?
      )`,
			[
				logID,
				payload.jti,
				0,
				payload.customerID.replace(/([a-zA-Z])[^@]*([a-zA-Z])(@.+)/, '$1*****$2$3')
			]
		);

		// CHECK JTI EXISTS IN DB. IF IT DOES, REMOVE IT.
		const [deleteResult] = await pool.query(
			`DELETE FROM jwt WHERE jti = UUID_TO_BIN(?)`,
			[payload.jti]
		);

		const jtiExisted = deleteResult.affectedRows > 0;

		if (!jtiExisted) {
			await pool.query(
				`UPDATE jwt_log_events SET reason = ? WHERE id = UUID_TO_BIN(?)`,
				["Unauthorized Access: JTI doesn't exist", logID]
			);

			throw new Error("Unauthorized Access Detected! jti doesn't exist!");
		}

		jti = payload.jti;
		command = parseInt(payload.command);

		if (command !== action) {
			await pool.query(
				`UPDATE jwt_log_events SET reason = ? WHERE id = UUID_TO_BIN(?)`,
				["Unauthorized Access: Action didn't match", logID]
			);

			throw new Error("Unauthorized Access Detected! Action didn't match!");
		}

		await pool.query(
			`UPDATE jwt_log_events SET success = 1, reason = ? WHERE id = UUID_TO_BIN(?)`,
			["JWT verified successfully", logID]
		);

		return payload.customerID;
	} catch (error: any) {
		console.error("JWT Verification Error Details:", {
			message: error.message,
			stack: error.stack,
			name: error.name,
			code: error.code,
		});

		try {
			await pool.query(
				`UPDATE jwt_log_events SET reason = ? WHERE id = UUID_TO_BIN(?) AND reason IS NULL`,
				[error.message, logID]
			);
		} catch (logError) {
			console.error("Failed to update log:", logError);
		}

		throw new Error(`JWT verification failed: ${error.message}`, {
			cause: error,
		});
	}
}
