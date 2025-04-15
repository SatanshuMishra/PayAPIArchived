import { FastifySchemaWithDocs } from "@/types/fastify/FastifySchemaWithDocs";

export const RegisterCardRoute: FastifySchemaWithDocs = {
	description:
		"Register a new credit/debit card as a payment method. This call will NOT assign the card to a specific customer.",
	tags: ["payment-methods"],
	body: {
		type: "object",
		properties: {
			cardNumber: {
				type: "string",
				description: "Credit/debit card number",
				pattern: "^[0-9]{13,19}$",
			},
			expMonth: {
				type: "number",
				description: "Card expiration month (1-12)",
				minimum: 1,
				maximum: 12,
			},
			expYear: {
				type: "number",
				description: "Card expiration year (4-digit format)",
				minimum: 2023,
			},
			avsPostalCode: {
				type: "string",
				description: "Postal/ZIP code for Address Verification Service",
			},
		},
		required: ["cardNumber", "expMonth", "expYear", "avsPostalCode"],
	},
	response: {
		200: {
			description: "Card successfully registered",
			type: "object",
			properties: {
				banquest_ID: {
					type: "string",
					description:
						"Unique identifier for the registered payment method",
				},
			},
		},
		400: {
			description: "Invalid input parameters",
			type: "object",
			properties: {
				error: {
					type: "string",
					description: "Error type identifier",
				},
				message: {
					type: "string",
					description: "Human-readable error message",
				},
			},
		},
		409: {
			description: "Card already exists in the system",
			type: "object",
			properties: {
				error: {
					type: "string",
					description: "Error type identifier",
				},
				message: {
					type: "string",
					description: "Human-readable error message",
				},
				banquest_ID: {
					type: "string",
					description: "Existing card identifier",
				},
			},
		},
		500: {
			description: "Server error occurred",
			type: "object",
			properties: {
				error: {
					type: "string",
					description: "Error type identifier",
				},
				message: {
					type: "string",
					description: "Human-readable error message",
				},
				cause: {
					type: "string",
					description: "Error cause information",
				},
			},
		},
	},
	security: [{ bearerAuth: [] }],
};
