import fastify, {
	FastifyPluginAsync,
	FastifyRequest,
	FastifyReply,
} from "fastify";
import "dotenv/config";
import { GatewayError } from "@/errors";
import findCustomer from "@/services/customer/getCustomer";
import createCustomer from "@/services/customer/createCustomer";
import getCustomer from "@/services/customer/getCompleteCustomer";
import {
	GetCustomerRoute,
	LookupCustomerRoute,
	RegisterCustomerRoute,
} from "@/types/routes/customer/customer";
import lookupCustomer from "@/services/customer/lookupCompleteCustomer";

interface RequestCreateCustomer {
	customerIdentifier: string;
}

const customer: FastifyPluginAsync = async (fastify) => {
	fastify.post<{ Body: RequestCreateCustomer; Reply: FastifyReply }>(
		"/customers",
		{
			schema: RegisterCustomerRoute,
		},
		async (
			request: FastifyRequest<{ Body: RequestCreateCustomer }>,
			reply: FastifyReply
		) => {
			try {
				const { customerIdentifier } = request.body;
				const clientContext = request.clientContext;

				//  NOTE: CHECK IF CUSTOMER IDENTIFIER EXISTS

				if (customerIdentifier === "" || customerIdentifier === null) {
					const error = new GatewayError(
						`Customer Identifier must be provided with each call.`
					);
					error.statusCode = 422;
					throw error;
				}

				// NOTE: CHECK IF A CUSTOMER WITH THE SAME CUSTOMER IDENTIFER ALREADY EXISTS

				const customerExists = await findCustomer(customerIdentifier);

				if (customerExists !== null) {
					const error = new GatewayError(
						`Customer with the provided details already exists`
					);
					error.statusCode = 409;
					throw error;
				}

				// NOTE: CREATE NEW CUSTOMER WITH IDENTIFIER

				const customer = await createCustomer(customerIdentifier);

				return reply.code(201).send({
					message: `Customer was successfully created.`,
					customerID: customer.customer_ID,
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
	fastify.get<{
		Querystring: { customerID: string };
		Reply: {
			message: string;
			customer: {
				id: string;
				banquestCustomerID: string;
				email: string;
			};
		};
	}>(
		"/customers/",
		{
			schema: GetCustomerRoute,
		},
		async (
			request: FastifyRequest<{ Querystring: { customerID: string } }>,
			reply: FastifyReply
		) => {
			const { customerID } = request.query;

			const customer = await getCustomer(customerID);

			return reply.code(201).send({
				message: `Customer was found successfully`,
				customer: {
					id: customer?.customerID,
					banquestCustomerID: customer?.banquestCustomerID,
					email: customer?.email,
				},
			});
		}
	);
	fastify.get<{
		Querystring: { customerIdentifier: string };
		Reply: {
			status: number;
			message: string;
			customer: {
				customerID: string;
				banquestCustomerID: string;
				email: string;
			};
		};
	}>(
		"/customers/lookup/",
		{
			schema: LookupCustomerRoute,
		},
		async (
			request: FastifyRequest<{
				Querystring: { customerIdentifier: string };
			}>,
			reply: FastifyReply
		) => {
			const { customerIdentifier } = request.query;

			const customer = await lookupCustomer(customerIdentifier);

			return reply.code(201).send({
				message: `Customer was found successfully`,
				customer: {
					id: customer?.customerID,
					banquestCustomerID: customer?.banquestCustomerID,
					email: customer?.email,
				},
			});
		}
	);
};

export default customer;
