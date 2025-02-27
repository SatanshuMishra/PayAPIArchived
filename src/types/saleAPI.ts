import { z } from "zod";

/*
 *	UNDERSTANDING THIS DOCUMENT
 *
 *	THIS DOCUMENT HOLDS ALL THE TYPE INFORMATION FOR REQUESTS AND RESPONSES FOR BANQUEST. WHILE RESPONSES SHOULD ALIGN WITH WHAT BANQUEST HAS ON THEIR DOCUMENTATION, THE REQUESTS WILL BE TAILORED TO MEET THE REQUIREMENTS WE SET FOR THE INFORMATION WE WANT TO SEND TO BANQUEST.
 *
 *	e.g., WHILE AVS INFORMATION FOR VALIDATING CARDS IS AN OPTIONAL FIELD ON BANQUEST, IT WILL BE A REQUIRED FIELD ON OUR END SINCE WE ALWAYS WANT TO CHECK THIS TO REDUCE POTENTIAL FRAUD.
 *
 *	FUTURE DEVELOPERS ARE RECOMMENDED TO READ THE BANQUEST API DOCUMENTATIONS ALONG SIDE THE TYPES MENTIONED IN THIS DOCUMENT TO UNDERSTAND HOW THE API WILL WORK.
 *
 *	 DOCUMENTATION: https://docs.banquestgateway.com/api/v2
 *
 */

export const ChargeRequest = z.object({
	amount: z
		.number()
		.min(0.01, "Minimum charge amount is $0.01.")
		.max(20000000, "Minimum charge amount is $0.01."),
	card: z
		.string()
		.min(14, "Card number must be at least 14 digits.")
		.max(16, "Card number must be at most 16 digits.")
		.regex(/^\d+$/, "Card number must only contain digits."),
	expiry_month: z
		.number()
		.min(1, "The month can't be less than 1, ;)!")
		.max(12, "The month can't be greater than 12, ;)!"),
	expiry_year: z
		.number()
		.min(
			new Date().getFullYear(),
			`Only cards expiring in ${new Date().getFullYear()} or later are accepted.`
		)
		.max(
			9999,
			`Only cards expiring before ${new Date().getFullYear()} or later are accepted.`
		),
	name: z.string().max(255, "Your name is too big."),
	transaction_details: z.object({
		client_ip: z.string().max(255, "IP address is too big."),
		invoice_number: z.string().max(255, "Invoice number is too big."),
		po_number: z.optional(z.string().max(255, "PO number is too big.")),
		order_number: z.string().max(255, "Order number is too big."),
	}),
	custom_fields: z.object({
		actor: z.string().describe("Who initiated the action"),
	}),
	ignore_duplicates: z.boolean(),
	customer: z.object({
		email: z
			.string()
			.max(255, "Email address is too big.")
			.email({ message: "Invalid customer email provided." }),
		customer_id: z.number().min(1, "Invalid Banquest customer ID."),
	}),
	avs_address: z.string().max(255, "AVS address is too big"),
	avs_zip: z.string().max(50, "AVS zip code is too big"),
	cvv2: z.string().min(3, "CVV is too small").max(3, "CVV is too big").regex(/^\d+$/, "CVV should only contain digits"),
	capture: z.boolean().default(true),
	save_card: z.boolean().default(true)
});
