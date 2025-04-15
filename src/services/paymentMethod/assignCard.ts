import { GatewayError } from "@/errors";
import "dotenv/config";
import pool from "@/db";
import getBanquestCustomerID from "../customer/getBanquestCustomerID";
import { CreatePaymentMethodResponse } from "@/types/Customers";

export default async function assignCard(
	customer_ID: string,
	payment_ID: string,
	source: string,
	expiry_month: number,
	expiry_year: number
): Promise<{
	status: string;
	message: string;
	banquest_payment_ID: number;
}> {
	try {
		const banquestCustomerID = await getBanquestCustomerID(customer_ID);
		const bqResponse = await fetch(
			`${process.env.BANQUEST_API_URL_SANDBOX}/${banquestCustomerID}/payment-methods`,
			{
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${btoa(`${process.env.BANQUEST_API_KEY_SANDBOX}:${process.env.BANQUEST_API_PIN_SANDBOX}`)}`,
				},
				body: JSON.stringify({
					source,
					expiry_month,
					expiry_year,
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

		const bqResponseData: CreatePaymentMethodResponse =
			await bqResponse.json();

		await pool.query(
			`INSERT INTO customer_payment_card (customer_ID, payment_ID, banquest_payment_ID) VALUES (UUID_TO_BIN(?), UUID_TO_BIN(?), ?)`,
			[customer_ID, payment_ID, bqResponseData.id]
		);

		return {
			status: "Sucess",
			message: "Card was successfully assigned to customer.",
			banquest_payment_ID: bqResponseData.id,
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
