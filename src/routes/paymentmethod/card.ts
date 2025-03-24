import fastify, {
	FastifyPluginAsync,
	FastifyRequest,
	FastifyReply,
} from "fastify";
import "dotenv/config";
import pool from "@/db";
import {
	cardNumberSchema,
	expMonthSchema,
	expYearSchema,
	avsPostalCodeSchema,
} from "@/types/Schemas";
import { GatewayError } from "@/errors";
import validateAndFormatUUID from "@/scripts/validateAndFormatUUID";
import { v4 as uuidv4 } from "uuid";
import { RegisterCardRoute } from "@/types/routes/paymentmethod/card";

interface RequestParams {
	customerID: string;
	cardNumber: string;
	expMonth: number;
	expYear: number;
	avsPostalCode: string;
}

interface CardResponse {
	banquest_ID: string;
}

async function getCardByDetails(
	customerID: string,
	cardNumber: string,
	expMonth: number,
	expYear: number,
	avsPostalCode: string
) {
	const lastFourDigits = cardNumber.slice(-4);
	const cardType = determineCardType(cardNumber);

	const [cardResult] = await pool.query(
		`
		SELECT banquest_payment_ID
		FROM payment_card
		WHERE 
			customer_ID = UUID_TO_BIN(?) AND
			last_four_digits = ? AND 
			avs_postal_code = ? AND 
			exp_month = ? AND 
			exp_year = ? AND 
			card_type = ?
		LIMIT 1
	`,
		[customerID, lastFourDigits, avsPostalCode, expMonth, expYear, cardType]
	);

	//@ts-ignore
	const exists = cardResult.length > 0;

	if (!exists) {
		return {
			exists_flag: false,
			banquest_payment_ID: null,
		};
	}

	return {
		exists_flag: true,
		// @ts-ignore
		banquest_payment_ID: cardResult[0].banquest_payment_ID,
	};
}

async function getBanquestID(customerID: string): Promise<string> {
	// @ts-ignore
	const [rows] = await pool.query(
		`SELECT banquest_ID FROM customer WHERE customer_ID = UUID_TO_BIN(?);`,
		[customerID]
	);

	if (rows.length === 0) {
		const error = new GatewayError(
			`No customer with the provided ID exists.`
		);
		error.statusCode = 404;
		throw error;
	}

	return rows[0].banquest_ID;
}

function determineCardType(cardNumber: string): string {
	if (cardNumber.startsWith("4")) {
		return "V";
	} else if (/^5[1-5]/.test(cardNumber)) {
		return "M";
	} else {
		const error = new GatewayError(
			"The provided card type is not accepted by the system. Only Visa or Mastercard cards are accepted."
		);
		error.statusCode = 400;
		throw error;
	}
}

const card: FastifyPluginAsync = async (fastify) => {
	fastify.post<{ Body: RequestParams; Reply: CardResponse }>(
		`/payment-methods/card`,
		{
			schema: RegisterCardRoute
		},
		async (
			request: FastifyRequest<{ Body: RequestParams }>,
			reply: FastifyReply
		) => {
			try {
				const {
					cardNumber,
					expMonth,
					expYear,
					avsPostalCode,
				} = request.body;

				try {
					cardNumberSchema.parse(cardNumber);
				} catch (error) {
					const gatewayError = new GatewayError(
						"Card number provided is incorrect"
					);
					gatewayError.statusCode = 400;
					throw gatewayError;
				}

				try {
					expMonthSchema.parse(expMonth);
				} catch (error) {
					const gatewayError = new GatewayError(
						"The expiration month provided is incorrect"
					);
					gatewayError.statusCode = 400;
					throw gatewayError;
				}

				try {
					expYearSchema.parse(expYear);
				} catch (error) {
					const gatewayError = new GatewayError(
						"The expiration year provided is incorrect"
					);
					gatewayError.statusCode = 400;
					throw gatewayError;
				}

				try {
					avsPostalCodeSchema.parse(avsPostalCode);
				} catch (error) {
					const gatewayError = new GatewayError(
						"AVS Postal Code provided is incorrect"
					);
					gatewayError.statusCode = 400;
					throw gatewayError;
				}

				const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
				const currentYear = new Date().getFullYear();

				if (expYear < currentYear || (expYear === currentYear && expMonth < currentMonth)) {
					const gatewayError = new GatewayError(
						"Unable to save card. Card you are trying to save is expired."
					);
					gatewayError.statusCode = 400;
					throw gatewayError;
				}

				const cardQuery = await getCardByDetails(
					formattedCustomerID,
					cardNumber,
					expMonth,
					expYear,
					avsPostalCode
				);

				if (cardQuery.exists_flag) {
					return reply.code(409).send({
						message:
							"A payment method with these details already exists for this customer.",
						banquest_payment_ID: cardQuery.banquest_payment_ID,
					});
				}

				const [rows] = await pool.query(
					`SELECT banquest_ID FROM customer WHERE customer_ID = UUID_TO_BIN(?)`,
					[formattedCustomerID]
				);

				//@ts-ignore
				if (rows.length === 0) {
					const error = new GatewayError(
						"Failed to retrieve ID. No customer with provided credentials exists."
					);
					error.statusCode = 404;
					throw error;
				}

				// @ts-ignore
				const banquestCustomerId = rows[0].banquest_ID;

				const response = await fetch(
					`${process.env.BANQUEST_API_URL_SANDBOX}/customers/${banquestCustomerId}/payment-methods`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Basic ${btoa(`${process.env.BANQUEST_API_KEY_SANDBOX}:${process.env.BANQUEST_API_PIN_SANDBOX}`)}`
						},
						body: JSON.stringify({
							card: cardNumber,
							expiry_month: expMonth,
							expiry_year: expYear,
						}),
					}
				);

				if (!response.ok) {
					throw new Error(`BQ returned Error with inserting card.`);
				}

				const responseData: {
					cardRef: string;
				} = await response.json();

				const paymentCardID = uuidv4();
				await pool.query(
					`INSERT INTO payment_card (id, banquest_payment_ID, customer_ID, last_four_digits, avs_postal_code, exp_month, exp_year, card_type) VALUES (UUID_TO_BIN(?), ?, UUID_TO_BIN(?), ?, ?, ?, ?, ?)`,
					[
						paymentCardID,
						responseData.cardRef,
						formattedCustomerID,
						cardNumber.slice(-4),
						avsPostalCode,
						expMonth,
						expYear,
						determineCardType(cardNumber)
					]
				);

				return reply.code(200).send({
					banquest_ID: responseData.cardRef,
				});
			} catch (err: any) {
				if (err instanceof GatewayError) {
					return reply.code(err.statusCode).send({
						error: err.name,
						message: err.message,
						cause: err.cause
					});
				}

				reply.code(500).send({
					error: "Internal Server Error",
					message:
						"An unexpected error occurred while processing your request.",
					cause: err.message,
				});
			}
		}
	);
};

export default card;
