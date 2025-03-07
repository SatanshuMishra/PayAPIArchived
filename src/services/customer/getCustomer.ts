import { GatewayError } from "@/errors";
import "dotenv/config";
import pool from "@/db";

export default async function createCustomer(
	email: string
): Promise<{
	status: string;
	message: string;
	customer_ID: string;
}> {
	try {
		const [rows] = await pool.query(
			`SELECT customer_ID FROM customer WHERE email = ?`,
			[email]
		);

		//@ts-ignore
		if (rows.length === 0) {
			const error = new GatewayError(`Couldn't get Card. The customer has no cards matching the provided details.`);
			error.statusCode = 404;
			throw error;
		}

		//@ts-ignore
		if (rows.length > 1) {
			const error = new GatewayError(`Couldn't get Card. The customer has no cards matching the provided details. Contact Support Immediately.`);
			error.statusCode = 409;
			throw error;
		}

		return {
			status: "Sucess",
			message: "Customer was successfully created.",
			//@ts-ignore
			customer_ID: rows[0].customer_ID
		};
	} catch (err: any) {
		if (err instanceof GatewayError) {
			throw err;
		}

		const error = new GatewayError(`Internal Server Error`);
		error.statusCode = 500;
		throw error;
	}
}
