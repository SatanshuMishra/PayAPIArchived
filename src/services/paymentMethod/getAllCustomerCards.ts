import { GatewayError } from "@/errors";
import "dotenv/config";
import pool from "@/db";

export default async function getCardWithDetails(customerID: string): Promise<{
	status: number;
	message: string;
	payment_ID: string;
}> {
	try {
		return {
			status: 201,
			message: "Success",
			payment_ID: "ABCD",
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
