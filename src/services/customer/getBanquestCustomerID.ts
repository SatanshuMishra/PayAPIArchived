import { GatewayError } from "@/errors";
import "dotenv/config";
import pool from "@/db";

export default async function getBanquestCustomerID(
	customer_ID: string,
): Promise<{
	status: string;
	message: string;
	banquest_customer_ID: string;
}> {
	try {
		const [rows] = await pool.query(
			`SELECT banquest_customer_ID FROM customer WHERE customer_ID = UUID_TO_BIN(?);`,
			[
				customer_ID
			]
		);

		//@ts-ignore
		if (rows.length === 0) {
			const error = new GatewayError(`Couldn't get Customer ID. No customer exists with the provided details.`);
			error.statusCode = 404;
			throw error;
		}

		//@ts-ignore
		if (rows.length > 1) {
			const error = new GatewayError(`Couldn't get Customer ID. More than one customer with the same details found. Contact Support Immediately.`);
			error.statusCode = 409;
			throw error;
		}

		return {
			status: "Sucess",
			message: "Customer was found.",
			//@ts-ignore
			banquest_customer_ID: rows[0].banquest_ID,
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

