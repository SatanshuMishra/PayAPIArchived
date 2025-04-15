import { GatewayError } from "@/errors";
import "dotenv/config";
import pool from "@/db";

export default async function getCustomerCard(
	customer_ID: string,
	last4: string,
	expiry_month: number,
	expiry_year: number,
	avs_zip: string,
	card_type: string
): Promise<{
	status: string;
	message: string;
	id: string;
}> {
	try {
		const [rows] = await pool.query(
			`SELECT banquest_payment_ID FROM customer_card_lookup WHERE customer_ID = UUID_TO_BIN(?) AND last4 = ? AND avs_zip = ? AND expiry_month = ? AND expiry_month = ? AND expiry_year = ? AND card_type = ?;`,
			[
				customer_ID,
				last4,
				avs_zip,
				expiry_month,
				expiry_year,
				card_type,
			]
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
			message: "Card was found.",
			//@ts-ignore
			id: rows[0].banquest_payment_ID,
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
