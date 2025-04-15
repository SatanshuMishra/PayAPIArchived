import { GatewayError } from "@/errors";
import "dotenv/config";
import pool from "@/db";

export default async function getCardWithDetails(
	last4: string,
	expiry_month: number,
	expiry_year: number,
	avs_zip: string,
): Promise<{
	status: number;
	message: string;
	payment_ID: string;
}> {
	try {
		const [rows] = await pool.query(
			`SELECT id FROM payment_card WHERE last4 = ? AND avs_zip = ? AND expiry_month = ? AND expiry_month = ? AND expiry_year = ?;`,
			[
				last4,
				avs_zip,
				expiry_month,
				expiry_year
			]
		);

		//@ts-ignore
		if (rows.length === 0) {
			const error = new GatewayError(`Couldn't get Card. No card exists with the provided details.`);
			error.statusCode = 404;
			throw error;
		}

		//@ts-ignore
		if (rows.length > 1) {
			const error = new GatewayError(`Couldn't get Card. More than one card with the same details found. Contact Support Immediately.`);
			error.statusCode = 409;
			throw error;
		}

		return {
			status: 200,
			message: "Card was found.",
			//@ts-ignore
			payment_ID: rows[0].id,
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

