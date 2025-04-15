import "dotenv/config";
import pool from "@/db";
import { v4 as uuidv4 } from "uuid";
import { GatewayError } from "@/errors";

export default async function verifyJWT(
	token: string,
	requestDetails: {
		path: string;
		method: string;
	},
	clientContext: {
		ip: string;
		fingerprint: string;
	}
): Promise<boolean> {
	const jose = await import("jose");

	// STEP 1: LOG JWT VERIFICATION ATTEMPT.
	// DEFAULT LOG TO FAILURE. WE WILL UPDATE THIS LATER IF VERIFICATION SUCCEEDS

	const logID = uuidv4();
	let jti = null;
	let command = null;
	try {
		// await pool.query(
		// 	`INSERT INTO jwt_log_events (
		//       id, event_type, success, ip, browser_fingerprint, actor_id
		//     ) VALUES (
		//       UUID_TO_BIN(?), ?, ?, INET6_ATON(?), ?, NULL
		//     )`,
		// 	[logID, 0, 0, clientContext.ip, clientContext.fingerprint]
		// );

		// STEP 2: DECRYPT JWT

		const decryptionKey = await jose.importJWK(
			JSON.parse(process.env.JWT_ENCRYPTION_KEY || "{}")
		);
		const { plaintext } = await jose.compactDecrypt(token, decryptionKey);
		const jwt = new TextDecoder().decode(plaintext);
		const {
			payload,
		}: {
			payload: {
				command: string;
				jti: string;
			};
		} = await jose.jwtVerify(
			jwt,
			new TextEncoder().encode(process.env.JWT_SECRET)
		);

		// await pool.query(
		// 	`INSERT INTO jwt_log_details (
		//       log_id, jti, command, customer_email
		//     ) VALUES (
		//       UUID_TO_BIN(?), UUID_TO_BIN(?), ?, ?
		//     )`,
		// 	[logID, payload.jti, 0]
		// );

		const [deleteResult] = await pool.query(
			`DELETE FROM jwt WHERE jti = UUID_TO_BIN(?)`,
			[payload.jti]
		);

		//@ts-ignore
		const jtiExisted = deleteResult.affectedRows > 0;
		if (!jtiExisted) {
			// await pool.query(
			// 	`UPDATE jwt_log_events SET reason = ? WHERE id = UUID_TO_BIN(?)`,
			// 	["Unauthorized Access: JTI doesn't exist", logID]
			// );

			throw new Error("Unauthorized Access Detected! jti doesn't exist!");
		}
		jti = payload.jti;
		command = payload.command;

		let path = requestDetails.path;

		if (requestDetails.method == "GET") {
			path = path.split("?")[0];
			path = path.endsWith("/") ? path.slice(0, -1) : path;
			console.log(`Formatted Path: ${path}`);
		}

		// STEP 4: VERIFY ENDPOINT EXISTS & JWT IS FOR REQUESTED ENDPOINT
		const [rows] = await pool.query(
			`SELECT permission_id AS endpoint_id 
			FROM permission 
			WHERE method = ? 
			AND endpoint_path = ?`,
			[requestDetails.method, path]
		);

		//@ts-ignore
		if (rows.length === 0) {
			const error = new GatewayError(`Invalid request endpoint.`);
			error.statusCode = 404;
			throw error;
		}

		//@ts-ignore
		if (rows[0].endpoint_id !== command) {
			const error = new GatewayError(
				`The token doesn't have permission to make this request.`
			);
			error.statusCode = 401;
			throw error;
		}

		return true;
	} catch (error: any) {
		console.error("JWT Verification Error Details:", {
			message: error.message,
			stack: error.stack,
			name: error.name,
			code: error.code,
		});
		try {
			// await pool.query(
			// 	`UPDATE jwt_log_events SET reason = ? WHERE id = UUID_TO_BIN(?) AND reason IS NULL`,
			// 	[error.message, logID]
			// );
		} catch (logError) {
			console.error("Failed to update log:", logError);
		}

		throw new Error(`JWT verification failed: ${error.message}`, {
			cause: error,
		});
	}
}
