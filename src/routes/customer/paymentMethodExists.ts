import fastify, {
	FastifyPluginAsync,
	FastifyRequest,
	FastifyReply,
} from "fastify";
import "dotenv/config";
import pool from "@/db";
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import { GatewayError } from "@/errors";

import validateAndFormatUUID from "@/scripts/validateAndFormatUUID";

interface RouteParams {
	customerID: string;
	paymentID: string;
}

const paymentMethodExists: FastifyPluginAsync = async (fastify) => {
	fastify.get<{ Params: RouteParams }>(
		`/customer/:customerID/payment/:paymentID/exists`,
		async (request: FastifyRequest<{ Params: RouteParams }>, reply: FastifyReply) => {
			try {
				const { customerID, paymentID } = request.params;

				const {
					valid: customerIDValid,
					formattedUUID: formattedCustomerID,
				} = validateAndFormatUUID(customerID);

				const {
					valid: paymentIDValid,
					formattedUUID: formattedPaymentID,
				} = validateAndFormatUUID(paymentID);

				if (!customerIDValid) {
					const error = new GatewayError(
						"The customer ID provided is invalid. The endpoint only accepts UUID values."
					);
					error.statusCode = 400;
					throw error;
				}

				if (!paymentIDValid) {
					const error = new GatewayError(
						"The payment ID provided is invalid. The endpoint only accepts UUID values."
					);
					error.statusCode = 400;
					throw error;
				}

				console.log(formattedCustomerID, formattedPaymentID);

				const [rows] = await pool.query(
					`SELECT EXISTS(
								    SELECT 1 
									FROM customer_payment_card 
									WHERE customer_ID = UUID_TO_BIN(?) 
									AND payment_ID = UUID_TO_BIN(?)
								) AS exists_flag;`,
					[formattedCustomerID, formattedPaymentID]
				);

				if (!rows[0].exists_flag)
					return reply.code(404).send({
						message:
							"Payment Method does not exist on provided customer.",
					});

				return reply.code(200).send({
					message: "Card is assigned to customer",
				});
			} catch (err: any) {
				if (err instanceof GatewayError) {
					return reply.code(err.statusCode).send({
						error: err.name,
						message: err.message,
					});
				}

				reply
					.code(500)
					.send({
						error: "Internal Server Error. Please contact support.",
						message: err.message,
						cause: err.cause
					});
			}
		}
	);
};


export default paymentMethodExists;
