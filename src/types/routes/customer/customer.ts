import { FastifySchemaWithDocs } from "@/types/fastify/FastifySchemaWithDocs";

export const RegisterCustomerRoute: FastifySchemaWithDocs = {
	description:
		"Register a new customer. This endpoint will store the customer both in the Payment Gateway database and add the customer to the external payment API(s) used.",
	tags: ["customer"],
	body: {
		type: "object",
		properties: {
			customerIdentifier: {
				type: "string",
				description:
					"Customer identifier on the software where this Payment Gateway is being used.",
			},
		},
		required: ["customerIdentifier"],
	},
	response: {
		201: {
			description: "Customer registered successfully.",
			type: "object",
			properties: {
				message: {
					type: "string",
					description:
						"Human-readable message to understand the result.",
				},
			},
		},
		409: {
			description: "Customer already exists in the system",
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
		422: {
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
				cause: {
					type: "string",
					description: "Cause of the error",
				},
			},
		},
		500: {
			description: "Internal Server Error",
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

export const GetCustomerRoute: FastifySchemaWithDocs = {
	description:
		"Get a customer by their customer ID. This method will not find customers by providing the customer identifier used by software where this payment gateway is being used. (e.g, emails)",
	tags: ["customer"],
	querystring: {
		type: "object",
		properties: {
			customerID: {
				type: "string",
				description:
					"Customer ID used on the Payement Gateway. Should be a UUIDv4.",
			},
		},
		required: ["customerID"],
	},
	response: {
		201: {
			description: "Customer customer was found.",
			type: "object",
			properties: {
				message: {
					type: "string",
					description:
						"Human-readable message to understand the result.",
				},
				customer: {
					type: "object",
					description:
						"Customer object including customer ID, banquest ID and email address.",
					properties: {
						id: {
							type: "string",
							description:
								"The customer's ID in the Payment Gateway system.",
						},
						banquestCustomerID: {
							type: "string",
							description: "The customer's banquest ID",
						},
						email: {
							type: "string",
							description: "The customer's email address",
						},
					},
				},
			},
		},
		500: {
			description: "Internal Server Error",
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

export const LookupCustomerRoute: FastifySchemaWithDocs = {
	description:
		"Get a customer by their customer identifier on the software where this payement gateway is being used.",
	tags: ["customer"],
	querystring: {
		type: "object",
		properties: {
			customerIdentifer: {
				type: "string",
				description:
					"Customer Identifer used on the Payement Gateway. Should be a UUIDv4.",
			},
		},
		required: ["customerIdentifier"],
	},
	response: {
		201: {
			description: "Customer customer was found.",
			type: "object",
			properties: {
				message: {
					type: "string",
					description:
						"Human-readable message to understand the result.",
				},
				customer: {
					type: "object",
					description:
						"Customer object including customer ID, banquest ID and email address.",
					properties: {
						id: {
							type: "string",
							description:
								"The customer's ID in the Payment Gateway system.",
						},
						banquestCustomerID: {
							type: "string",
							description: "The customer's banquest ID",
						},
						email: {
							type: "string",
							description: "The customer's email address",
						},
					},
				},
			},
		},
		500: {
			description: "Internal Server Error",
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
