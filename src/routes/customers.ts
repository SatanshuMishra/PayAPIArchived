import fastify, {
	FastifyPluginAsync,
	FastifyRequest,
	FastifyReply,
} from "fastify";
import type {
	CreateCustomerRequest,
	CreateCustomerResponse,
} from "@/types/CreateCustomer";
import verifyJWT from "@/scripts/verifyJWT";
import "dotenv/config";
import pool from "@/db";

const customers: FastifyPluginAsync = async (fastify) => {
	fastify.post<{ Body: FastifyRequest; Reply: FastifyReply }>(
		"/customers",
		async (request: any, reply: any) => {
			// const requestData: CreateCustomerRequest = {
			// 	identifier: "customer2@example.com",
			// 	first_name: "John",
			// 	last_name: "Doe",
			// 	active: true
			// };
			try {
				const authHeader = request.headers.authorization;
				if (!authHeader || !authHeader.startsWith("Bearer ")) {
					return reply
						.code(401)
						.send({
							error: "Missing or invalid authorization token",
						});
				}

				// VERY TOKEN

				const token = authHeader.split(" ")[1];
				const customerID = await verifyJWT(token, "Create Customer");

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

				if (!response.ok) throw new Error(`Error: ${response.status}`);
				const responseData: CreateCustomerResponse =
					await response.json();

				await pool.query(`INSERT INTO customer (banquestID, email) VALUES (?, ?);`, [responseData.id, responseData.identifier]);

				return reply.code(201).send({ status: "Success" });
			} catch (error: any) {
				throw new Error(
					`Failed to process transaction: ${error.message}`,
					{ cause: error }
				);
			}
		}
	);
};

export default customers;
