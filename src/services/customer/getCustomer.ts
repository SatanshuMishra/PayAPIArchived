import { GatewayError } from "@/errors";
import pool from "@/db";

interface Customer {
	customer_ID: string;
}

/**
 * Finds a customer by email
 *
 * @param email - The email to search for
 * @returns The customer if found, null otherwise
 * @throws GatewayError if multiple customers found or on server error
 */
export default async function findCustomer(
	email: string
): Promise<Customer | null> {
	try {
		const [rows] = await pool.query(
			`SELECT id FROM customer WHERE email = ?`,
			[email]
		);

		//@ts-ignore
		if (rows.length === 0) {
			return null;
		}

		//@ts-ignore
		if (rows.length > 1) {
			const error = new GatewayError(
				`Multiple customers found with the same email. Please contact support.`
			);
			error.statusCode = 409;
			throw error;
		}

		//@ts-ignore
		return rows[0].id;
	} catch (err: unknown) {
		if (err instanceof GatewayError) {
			throw err;
		}

		const error = new GatewayError(`Failed to check if customer exists. Internal Server Error.`);
		error.statusCode = 500;
		throw error;
	}
}
