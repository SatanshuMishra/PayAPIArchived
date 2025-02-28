import fastify, { FastifyPluginAsync, FastifyRequest, FastifyReply } from "fastify";
import type { CreateCustomerRequest, CreateCustomerResponse } from "@/types/CreateCustomer";

import "dotenv/config";

const customers: FastifyPluginAsync = async (fastify) => {
	fastify.post<{ Body: FastifyRequest; Reply: FastifyReply }>(
		"/customers",
		async (request: any) => {
			const requestData: CreateCustomerRequest = {
				identifier: "customer2@example.com",
				first_name: "John",
				last_name: "Doe",
				active: true
			};
			try {
				const response = await fetch(
					`${process.env.BANQUEST_API_URL_SANDBOX}/customers`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							"User-Agent": "PNCPaymentGateway",
							Authorization: `Basic ${btoa(`${process.env.BANQUEST_API_KEY_SANDBOX}:${process.env.BANQUEST_API_PIN_SANDBOX}`)}`
						},
						body: JSON.stringify(requestData)
					}
				);

				if (!response.ok) throw new Error(`Error: ${response.status}`);
				const responseData: CreateCustomerResponse = await response.json();
				return responseData;
			} catch (error) {
				throw new Error("Failed to process transaction.");
			}
		}
	)
}

export default customers;
