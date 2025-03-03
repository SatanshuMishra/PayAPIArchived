import "dotenv/config";
import pool from "@/db";

export default async function verifyJWT(
	token: string,
	action: string
): Promise<string> {
	const jose = await import("jose");
	try {
		// DECRYPT TOKEN
		const decryptionKey = await jose.importJWK(
			JSON.parse(process.env.JWT_ENCRYPTION_KEY || "{}")
		);

		const { plaintext } = await jose.compactDecrypt(token, decryptionKey);
		const jwt = new TextDecoder().decode(plaintext);

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

		// CHECK JTI EXISTS IN DB. IF IT DOES, REMOVE IT.
		console.log("Checking JTI in database:", payload.jti);
		const [deleteResult] = await pool.query(
			`DELETE FROM jwt WHERE jti = ?`,
			[payload.jti]
		);
		const jtiExisted = deleteResult.affectedRows > 0;
		console.log(
			"JTI Exists:",
			jtiExisted,
			"Affected Rows:",
			deleteResult.affectedRows
		);

		if (!jtiExisted) {
			throw new Error("Unauthorized Access Detected! jti doesn't exist!");
		}

		if (payload.command !== action) {
			throw new Error(
				"Unauthorized Access Detected! Action didn't match!"
			);
		}

		return payload.customerID;
	} catch (error: any) {
		console.error("JWT Verification Error Details:", {
			message: error.message,
			stack: error.stack,
			name: error.name,
			code: error.code,
		});

		throw new Error(`JWT verification failed: ${error.message}`, {
			cause: error,
		});
	}
}
