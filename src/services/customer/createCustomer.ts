import { GatewayError } from "@/errors";
import "dotenv/config";
import pool from "@/db";
import { v4 as uuidV4 } from 'uuid';

export default async function createCustomer(
	identifier: string
): Promise<{
	status: string;
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
				`Failed to save card. External Server Error.`
			);
			error.statusCode = 500;
			throw error;
		}

		const bqResponseData: { identifier: string, id: number } =
			await bqResponse.json();

		const customer_ID = uuidV4();
		await pool.query(
			`INSERT INTO customer (customer_ID, payment_ID, banquest_payment_ID) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?)`,
			[customer_ID, bqResponseData.id, identifier]
		);
		return {
			status: "Sucess",
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
