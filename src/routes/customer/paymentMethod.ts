import { GatewayError } from "@/errors";
import { checkUUID } from "@/scripts/validateAndFormatUUID";
import { expirationMonth, expirationYear } from "@/types/parsers/date";
import fastify, {
	FastifyRequest,
	FastifyReply,
	FastifyPluginAsync,
} from "fastify";

interface RequestAssignCard {
	customerID: string;
	paymentMethodID: string;
	source: string;
	expMonth: string;
	expYear: string;
}

const customerPaymentMethod: FastifyPluginAsync = async (fastify) => {
	fastify.post<{
		Body: RequestAssignCard;
		Replay: FastifyReply;
	}>(
		`/customer/payment-method/card`,
		async (
			request: FastifyRequest<{
				Body: RequestAssignCard;
			}>,
			reply: FastifyReply
		) => {
			const { customerID, paymentMethodID, source, expMonth, expYear } =
				request.body;

			try {
				checkUUID(customerID);
			} catch (error: any) {
				const err = new GatewayError(`${error.message}`);
				err.statusCode = 422;
				throw err;
			}

			try {
				checkUUID(paymentMethodID);
			} catch (error: any) {
				const err = new GatewayError(`${error.message}`);
				err.statusCode = 422;
				throw err;
			}

			// TODO: CHECK SOURCE: SOURCE IS THE REFERENCE TO THE CREDIT CARD

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
		}
	);
	fastify.get<{
		Querystring: { customerID: string };
		Reply: FastifyReply;
	}>(
		`/customer/payment-method/card`,
		async (
			request: FastifyRequest<{ Querystring: { customerID: string } }>,
			reply: FastifyReply
		) => {
			const { customerID } = request.query;

			try {
				checkUUID(customerID);
			} catch (error: any) {
				const err = new GatewayError(`${error.message}`);
				err.statusCode = 422;
				throw err;
			}
		}
	);
};
