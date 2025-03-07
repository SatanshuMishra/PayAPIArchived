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
import { v4 as uuidv4 } from "uuid";
import CryptoJS from "crypto-js";
import { z } from "zod";
import { GatewayError } from "@/errors";

const customer: FastifyPluginAsync = async (fastify) => {
	fastify.post<{ Body: { customerEmail: string }; Reply: FastifyReply }>(
		`/customer/exists`,
		{
			schema: {
				body: {
					type: "object",
					properties: {
						customerEmail: { type: "string" },
					},
					required: ["customerEmail"],
				},
				response: {
					200: {
						type: "object",
						properties: {},
					},
					400: {
						type: "object",
						properties: {
							message: { type: "string" },
						},
					},
					404: {
						type: "object",
						properties: {
							error: { type: "string" },
							message: { type: "string" },
						},
					},
					500: {
						type: "object",
						properties: {
							error: { type: "string" },
							message: { type: "string" },
							cause: { type: "string" },
						},
					},
				},
			},
		},
		async (
			request: FastifyRequest<{ Body: { customerEmail: string } }>,
			reply: FastifyReply
		) => {
			try {
				const { customerEmail } = request.body;

				if (!z.string().email().parse(customerEmail))
					return reply.code(400).send({
						message: "Provided customer email isn't valid.",
					});

				const [rows] = await pool.query(
					`SELECT EXISTS(
								    SELECT 1 
									FROM customer 
									WHERE email = ? 
								) AS exists_flag;`,
					[customerEmail]
				);

				//@ts-ignore
				if (!rows[0].exists_flag) {
					const error = new GatewayError(
						"No customer exists with the provided email."
					);
					error.statusCode = 404;
					throw error;
				}

				return reply.code(200).send({
					message: "Customer exists.",
				});
			} catch (err: any) {
				if (err instanceof GatewayError) {
					return reply.code(err.statusCode).send({
						error: err.name,
						message: err.message,
					});
				}

				reply.code(500).send({
					error: "Internal Server Error. Please contact support.",
					message: err.message,
					cause: err.cause,
				});
			}
		}
	),
		fastify.post<{ Body: FastifyRequest; Reply: FastifyReply }>(
			"/customer",
			async (request: FastifyRequest, reply: FastifyReply) => {
				try {
					const authHeader = request.headers.authorization;
					if (!authHeader || !authHeader.startsWith("Bearer ")) {
						return reply.code(401).send({
							error: "Missing or invalid authorization token",
						});
					}

					// GATHER LOGGING DETATILS

					const ip = request.ip || request.connection.remoteAddress;

					const userAgent = request.headers["user-agent"] || "";
					const acceptLanguage =
						request.headers["accept-language"] || "";
					const acceptEncoding =
						request.headers["accept-encoding"] || "";

					const fingerprint = CryptoJS.SHA256(
						`${userAgent}${acceptLanguage}${acceptEncoding}`
					).toString(CryptoJS.enc.Hex);

					const clientContext = {
						ip,
						fingerprint,
					};

					console.log(`CLIENT CONTEXT: `, clientContext);

					// VERY TOKEN

					const token = authHeader.split(" ")[1];

					if (token == "null") {
						return reply.code(401).send({
							message: "MISSING PROPER AUTHORIZATION PARAMETERS",
						});
					}

					const customerID = await verifyJWT(token, 0, clientContext);

					console.log(`CUSTOMER ID: `, customerID);

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
