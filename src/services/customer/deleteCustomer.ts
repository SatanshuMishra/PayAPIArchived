import { GatewayError } from "@/errors";
import "dotenv/config";
import pool from "@/db";
import getBanquestCustomerID from "./getBanquestCustomerID";

export default async function deleteCustomer(
	customer_ID: string
): Promise<{ status: string; message: string }> {
	try {

		const customerBanquestID = getBanquestCustomerID(customer_ID);
		const bqResponse = await fetch(
			`${process.env.BANQUEST_API_URL_SANDBOX}/customers/${customerBanquestID}`,
			{
				method: "DELETE",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Basic ${btoa(`${process.env.BANQUEST_API_KEY_SANDBOX}:${process.env.BANQUEST_API_PIN_SANDBOX}`)}`,
				},
			}
		);

		if (!bqResponse.ok) {
			const error = new GatewayError(
				`Failed to delete customer. External Server Error.`
			);
			error.statusCode = 500;
			throw error;
		}

		await pool.query(
			`DELETE FROM customer WHERE customer_ID = UUID_TO_BIN(?)`,
			[customer_ID]
		);
		return {
			status: "Sucess",
			message: "Customer was successfully deleted.",
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
