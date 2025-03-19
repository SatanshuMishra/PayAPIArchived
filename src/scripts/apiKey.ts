import pool from "@/db";
import { GatewayError } from "@/errors";
import { randomBytes, createHash } from "crypto";
import { v4 as uuidv4 } from "uuid";

type ApiKey = {
	id: string;
	keyHash: string;
	name: string;
	roleId: number;
	expiresAt?: Date;
};

export async function generateApiKey(
	name: string,
	roleId: number,
	expiresInMinutes?: number
): Promise<any> {
	const keyBytes = randomBytes(32);
	const key = keyBytes.toString("base64");
	const keyHash = createHash("sha256").update(key).digest("hex");
	const id = uuidv4();

	const apiKey: ApiKey = {
		id,
		keyHash,
		name,
		roleId,
	};

	if (expiresInMinutes) {
		const expiresAt = new Date();
		expiresAt.setDate(expiresAt.getDate() + expiresInMinutes / 1440);
		apiKey.expiresAt = expiresAt;
	}

	await pool.query(
		`INSERT INTO api_key (id, key_hash, name, role_id, expires_at) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?);`,
		[
			apiKey.id,
			apiKey.keyHash,
			apiKey.name,
			apiKey.roleId,
			apiKey.expiresAt || null,
		]
	);

	return { key, ...apiKey };
}

export async function verifyApiKey(
	providedKey: string,
	command: number
): Promise<boolean> {
	const keyHash = createHash("sha256").update(providedKey).digest("hex");

	console.log(`Key Hash: ${keyHash}\n Command: ${command}`)

	const [rows] = await pool.query(
		`
SELECT EXISTS (
SELECT 1
FROM api_key ak 
JOIN role_permission rp 
ON ak.role_id = rp.role_id 
WHERE ak.key_hash = ? 
AND rp.permission_id = ?
  ) as is_key_valid;
										`,
		[keyHash, command]
	);

	console.log(rows[0].is_key_valid, rows[0].is_key_valid ? "True" : "false");

	if (!rows[0].is_key_valid) {
		const error = new GatewayError(
			`API Key doesn't exists or has expired.`
		);
		error.statusCode = 401;
		throw error;
	}

	return true;
}

export async function updateApiKeyRole(
	keyID: string,
	newRoleID: number
): Promise<boolean> {
	await pool.query(
		`UPDATE api_key SET role_id = ${newRoleID} WHERE id = ${keyID}`
	);
	return true;
}

export async function revokeApiKey(keyID: string): Promise<boolean> {
	await pool.query(
		`UPDATE api_key SET is_active = FALSE WHERE id = ${keyID}`
	);
	return true;
}
