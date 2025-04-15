import { GatewayError } from "@/errors";
import "dotenv/config";
import pool from "@/db";
import { v4 as uuidV4 } from 'uuid';

export default async function createCustomer(
	identifier: string
): Promise<{
	status: number;
	message: string;
	customer_ID: string;
}> {
	try {
		const bqResponse = await fetch(
			`${process.env.BANQUEST_API_URL_SANDBOX}/customers`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${btoa(`${process.env.BANQUEST_API_KEY_SANDBOX}:${process.env.BANQUEST_API_PIN_SANDBOX}`)}`,
				},
				body: JSON.stringify({
					identifier
				}),
			}
		);

		if (!bqResponse.ok) {
			const error = new GatewayError(
				`Failed to save customer. External Server Error.`
			);
			error.statusCode = 500;
			throw error;
		}

		const bqResponseData: { identifier: string, id: number } =
			await bqResponse.json();

		const customer_ID = uuidV4();
		await pool.query(
			`INSERT INTO customer (id, banquest_customer_ID, email) VALUES (UUID_TO_BIN(?), ?, ?)`,
			[customer_ID, bqResponseData.id, identifier]
		);
		return {
			status: 201,
			message: "Customer was successfully created.",
			customer_ID
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
