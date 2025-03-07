import fastify, {
	FastifyPluginAsync,
	FastifyRequest,
	FastifyReply,
} from "fastify";
import type {
	CreateCustomerRequest,
	CreateCustomerResponse,
} from "@/types/CreateCustomer";
import "dotenv/config";
import pool from "@/db";
import { v4 as uuidv4 } from "uuid";

const customer: FastifyPluginAsync = async (fastify) => {
	fastify.post<{ Body: FastifyRequest; Reply: FastifyReply }>(
		"/customer",
		async (request: FastifyRequest, reply: FastifyReply) => {
			try {
				const clientContext = request.clientContext;
				// CHECK IF CUSTOMER EXSITS
				const [rows] = await pool.query(
					`SELECT email FROM customer WHERE email = ?;`,
					[customerID]
				);

				if (rows.length == 1)
					throw new Error(
						`Insert Failed: Customer with email ${customerID} already exists!`
					);

				const requestData: CreateCustomerRequest = {
					identifier: customerID,
					active: true,
				};
				const response = await fetch(
					`${process.env.BANQUEST_API_URL_SANDBOX}/customers`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"User-Agent": "PNCPaymentGateway",
							Authorization: `Basic ${btoa(`${process.env.BANQUEST_API_KEY_SANDBOX}:${process.env.BANQUEST_API_PIN_SANDBOX}`)}`,
						},
						body: JSON.stringify(requestData),
					}
				);

				if (!response.ok)
					throw new Error(`Error: ${response.status}`);
				const responseData: CreateCustomerResponse =
					await response.json();

				await pool.query(
					`INSERT INTO customer (id, banquest_ID, email) VALUES (UUID_TO_BIN(?), ?, ?);`,
					[uuidv4(), responseData.id, responseData.identifier]
				);

				return reply.code(201).send({ status: "Success" });
			} catch (error: any) {
				if (
					error.message.includes("Customer with email") &&
					error.message.includes("already exists")
				) {
					return reply.code(409).send({
						message: error.message,
					});
				}

				console.error("Transaction error:", error);
				return reply.code(500).send({
					message: `Failed to process transaction: ${error.message}`,
				});
			}
		}
	);
};

export default customer;
