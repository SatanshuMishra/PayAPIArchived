import fastify, {
	FastifyPluginAsync,
	FastifyRequest,
	FastifyReply,
} from "fastify";
import "dotenv/config";
import { paymentCardNumber, cardExpirationDate } from "@/types/parsers/card";
import { expirationMonth, expirationYear } from "@/types/parsers/date";
import { postalCode } from "@/types/parsers/address";
import { getCardType } from "@/scripts/functions/card";
import { GatewayError } from "@/errors";
import { RegisterCardRoute } from "@/types/routes/paymentmethod/card";
import saveCard from "@/services/paymentMethod/saveCard";
import getCardWithDetails from "@/services/paymentMethod/getCardWithDetails";

interface RequestParamsSaveCard {
	cardNumber: string;
	expMonth: number;
	expYear: number;
	avsPostalCode: string;
}

interface RequestParamsGetCard {
	last4: string;
	expMonth: number;
	expYear: number;
	avsPostalCode: string;
}

interface CardResponse { }

const card: FastifyPluginAsync = async (fastify) => {
	fastify.post<{ Body: RequestParamsSaveCard; Reply: CardResponse }>(
		`/payment-methods/card`,
		{
			schema: RegisterCardRoute,
		},
		async (
			request: FastifyRequest<{ Body: RequestParamsSaveCard }>,
			reply: FastifyReply
		) => {
			try {
				const { cardNumber, expMonth, expYear, avsPostalCode } =
					request.body;

				// STEP 1: CHECK ALL PARAMETERS ARE PRESENT AND VALID

				// CHECK CREDIT CARD
				try {
					paymentCardNumber.parse(cardNumber);
				} catch (error) {
					const gatewayError = new GatewayError(
						"Card number provided is incorrect"
					);
					gatewayError.statusCode = 400;
					throw gatewayError;
				}

				// CHECK EXPIRATION MONTH
				try {
					expirationMonth.parse(expMonth);
				} catch (error) {
					const gatewayError = new GatewayError(
						"The expiration month provided is incorrect"
					);
					gatewayError.statusCode = 400;
					throw gatewayError;
				}

				// CHECK EXPIRATION YEAR
				try {
					expirationYear.parse(expYear);
				} catch (error) {
					const gatewayError = new GatewayError(
						"The expiration year provided is incorrect"
					);
					gatewayError.statusCode = 400;
					throw gatewayError;
				}

				// CHECK AVS POSTAL CODE
				try {
					postalCode.parse(avsPostalCode);
				} catch (error) {
					const gatewayError = new GatewayError(
						"AVS Postal Code provided is incorrect"
					);
					gatewayError.statusCode = 400;
					throw gatewayError;
				}

				try {
					cardExpirationDate.parse({
						expirationMonth,
						expirationYear,
					});
				} catch (error) {
					const gatewayError = new GatewayError(
						"Unable to save card. Card you are trying to save is expired."
					);
					gatewayError.statusCode = 400;
					throw gatewayError;
				}

				// STEP 2: INSERT CARD

				const cardQuery = await saveCard(
					cardNumber,
					expMonth,
					expYear,
					avsPostalCode,
					getCardType(cardNumber)
				);

				return reply.code(201).send({
					message: "Card was successfully created.",
					paymentID: cardQuery.payment_ID,
					token: cardQuery.token,
				});
			} catch (err: any) {
				if (err instanceof GatewayError) {
					return reply.code(err.statusCode).send({
						error: err.name,
						message: err.message,
						cause: err.cause,
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

	fastify.post<{ Body: RequestParamsGetCard; Reply: CardResponse }>(
		`/payment-methods/card/lookup`,
		{
			schema: RegisterCardRoute,
		},
		async (
			request: FastifyRequest<{ Body: RequestParamsGetCard }>,
			reply: FastifyReply
		) => {
			try {
				const { last4, expMonth, expYear, avsPostalCode } =
					request.body;

				// TODO: CREATE ZOD PARSER FOR `last4`

				// CHECK EXPIRATION MONTH
				try {
					expirationMonth.parse(expMonth);
				} catch (error) {
					const gatewayError = new GatewayError(
						"The expiration month provided is incorrect"
					);
					gatewayError.statusCode = 400;
					throw gatewayError;
				}

				// CHECK EXPIRATION YEAR
				try {
					expirationYear.parse(expYear);
				} catch (error) {
					const gatewayError = new GatewayError(
						"The expiration year provided is incorrect"
					);
					gatewayError.statusCode = 400;
					throw gatewayError;
				}

				// CHECK AVS POSTAL CODE
				try {
					postalCode.parse(avsPostalCode);
				} catch (error) {
					const gatewayError = new GatewayError(
						"AVS Postal Code provided is incorrect"
					);
					gatewayError.statusCode = 400;
					throw gatewayError;
				}

				try {
					cardExpirationDate.parse({
						expirationMonth,
						expirationYear,
					});
				} catch (error) {
					const gatewayError = new GatewayError(
						"Unable to save card. Card you are trying to save is expired."
					);
					gatewayError.statusCode = 400;
					throw gatewayError;
				}

				const cardQuery = await getCardWithDetails(
					last4,
					expMonth,
					expYear,
					avsPostalCode
				);

				return reply.code(200).send({
					message: "Card with provided details was found.",
					paymentID: cardQuery.payment_ID,
				});
			} catch (err: any) {
				if (err instanceof GatewayError) {
					return reply.code(err.statusCode).send({
						error: err.name,
						message: err.message,
						cause: err.cause,
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
