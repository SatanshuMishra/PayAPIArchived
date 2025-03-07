import { GatewayError } from "@/errors";
import "dotenv/config";
import pool from "@/db";
import { v4 as uuidV4 } from 'uuid';
import { Transaction } from "@/types/Transactions";

export default async function charge(
	amount: number,
	payment_ID: string,
	cvv2: string,
	actor: string
): Promise<{
	status: string;
	message: string;
}> {
	try {
		const { currentMonth, currentYear } = {
			currentMonth: new Date().getMonth(),
			currentYear: new Date().getFullYear()
		};

		const bqResponse = await fetch(
			`${process.env.BANQUEST_API_URL_SANDBOX}/customers`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${btoa(`${process.env.BANQUEST_API_KEY_SANDBOX}:${process.env.BANQUEST_API_PIN_SANDBOX}`)}`,
				},
				body: JSON.stringify({
					amount,
					source: `pm-${payment_ID}`,
					ignore_duplicates: true,
					expiry_month: currentMonth,
					expiry_year: currentYear,
					cvv2,
					customer_fields: {
						actor
					}
				}),
			}
		);

		if (!bqResponse.ok) {
			const error = new GatewayError(
				`Failed to process charge. External Server Error.`
			);
			error.statusCode = 500;
			throw error;
		}

		const bqResponseData: Transaction =
			await bqResponse.json();

		return {
			status: "Sucess",
			message: "Charge was successfully processed."
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
