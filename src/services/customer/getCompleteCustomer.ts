import { GatewayError } from "@/errors";
import pool from "@/db";

interface Customer {
	customerID: string;
	banquestCustomerID: string;
	email: string;
}

/**
 * Finds a customer by ID
 *
 * @param ID - The customer ID to search for
 * @returns The the entire customer if found, null otherwise
 * @throws GatewayError if multiple customers found or on server error
 */
export default async function getCustomer(
	customerID: string,
	throwError: boolean = false
): Promise<Customer | null> {
	try {
		const [rows] = await pool.query(
			`SELECT BIN_TO_UUID(id) AS id, banquest_customer_ID, email FROM customer WHERE id = UUID_TO_BIN(?)`,
			[customerID]
		);

		//@ts-ignore
		if (rows.length === 0) {
			if (throwError) {
				const error = new GatewayError(
					`Customer with the provided ID was not found.`
				);
				error.statusCode = 404;
				throw error;
			} else {
				return null;
			}
		}

		return {
			// @ts-ignore
			customerID: rows[0].id,
			// @ts-ignore
			banquestCustomerID: rows[0].banquest_customer_ID,
			// @ts-ignore
			email: rows[0].email,
		};
	} catch (err: any) {
		if (err instanceof GatewayError) {
			throw err;
		}

		const error = new GatewayError(`Internal Server Error`);
		error.cause = err;
		error.statusCode = 500;
		throw error;
	}
}
