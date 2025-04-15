import { z } from "zod";

export const CreateCustomerRequestSchema = z.object({
	identifier: z
		.string()
		.max(255, "Email address is too big.")
		.email({ message: "Invalid customer email provided." })
		.describe("We use customer email's for customer identification."),
	active: z.boolean().default(true),
});


export const CreateCustomerResponseSchema = z.object({
	id: z.number().describe("Banquest's Customer ID"),
	identifier: z.string().describe("Customer's email"),
	active: z.boolean()
});

export type CreateCustomerRequest = z.infer<typeof CreateCustomerRequestSchema>;
export type CreateCustomerResponse = z.infer<typeof CreateCustomerResponseSchema>;
