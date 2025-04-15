import { GatewayError } from "@/errors";
import "dotenv/config";
import pool from "@/db";
import { v4 as uuidV4 } from "uuid";

export default async function sa(
	card: string,
	expiry_month: number,
	expiry_year: number,
	avs_zip: string,
	card_type: string
): Promise<{
	status: string;
	message: string;
	payment_ID: string;
	token: string;
}> {
	try {
		const bqResponse = await fetch(
			`${process.env.BANQUEST_API_URL_SANDBOX}/transactions/verify`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${btoa(`${process.env.BANQUEST_API_KEY_SANDBOX}:${process.env.BANQUEST_API_PIN_SANDBOX}`)}`
				},
				body: JSON.stringify({
					card,
					expiry_month,
					expiry_year,
					save_card: true
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

		const bqResponseData: { cardRef: string } = await bqResponse.json();

		// INSERT SAVED CARD INTO GATEWAY DATABASE

		const payment_ID = uuidV4();

		await pool.query(
			`INSERT INTO payment_card (id, banquest_token, last_4, avs_zip, expiry_month, expiry_year, card_type) VALUES (UUID_TO_BIN(?), ?, ?, ?, ?, ?, ?);`,
			[
				payment_ID,
				bqResponseData.cardRef,
				card.slice(-4),
				avs_zip,
				expiry_month,
				expiry_year,
				card_type,
			]
		);

		return {
			status: "Sucess",
			message: "Card was successfully added.",
			payment_ID,
			token: bqResponseData.cardRef,
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
