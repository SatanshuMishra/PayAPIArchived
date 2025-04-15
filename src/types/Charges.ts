import { z } from "zod";

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
	cvv2: z
		.string()
		.min(3, "CVV is too small")
		.max(3, "CVV is too big")
		.regex(/^\d+$/, "CVV should only contain digits"),
	capture: z.boolean().default(true),
	save_card: z.boolean().default(true),
});

export const ChargeResponse = z.object({
	version: z.string(),
	status: z.enum([
		"Approved",
		"Partially Approved",
		"Submitted",
		"Declined",
		"Error",
	]),
	status_code: z.enum(["A", "P", "D", "E"]),
	error_message: z.string(),
	error_code: z.string(),
	error_details: z
		.union([z.string(), z.record(z.any())])
		.describe(
			"This is for details about the error. For schema validation errors, this can be an object whose keys are the field names with invalid data, and the values are an array of issues."
		),
	auth_amount: z.number(),
	auth_code: z.number(),
	reference_number: z
		.number()
		.describe(
			"Reference number for the new transaction. This can be used to reference the transaction later on."
		),
	transaction: z.object({
		id: z
			.number()
			.describe(
				"Reference number for the new transaction. This can be used to reference the transaction later on."
			),
		created_at: z.string(),
		settled_date: z.string(),
		amount_details: z.object({
			amount: z.number(),
			tax: z.number(),
			surcharge: z.number(),
			shipping: z.number(),
			tip: z.number(),
			discount: z.number(),
			subtotal: z.number(),
			original_requested_amount: z.number(),
			original_authorized_amount: z.number(),
		}),
		transaction_details: z.object({
			client_ip: z.string(),
			invoice_number: z.string(),
			po_number: z.string(),
			order_number: z.string(),
			source: z.string(),
			type: z.string(),
			reference_number: z
				.number()
				.describe(
					"The reference number of an earlier transaction referenced by this one (e.g. a refund)."
				),
			schedule_id: z.number(),
		}),
	}),
	customer: z.object({
		emai: z.string(),
		customer_id: z.string(),
	}),
	status_details: z.object({
		error_code: z.string(),
		error_message: z.string(),
		status: z.enum(["captured", "pending", "reserve", "originated", "returned", "cancelled", "queued", "declined", "error", "settled", "voided", "approved", "blocked", "unknown"])
	}),
	custom_fields: z.object({
		actor: z.string()
	}),
	check_details: z.object({
		name: z.string(),
		rounting_number: z.string(),
		account_number_last4: z.string(),
		account_type: z.string(),
		sec_code: z.enum(["PPD", "CCD", "TEL", "WEB"]),
		returned_at: z.string(),
		returned_code: z.string(),
		returned_reason: z.string()
	}),
	credit_details: z.object({
		name: z.string(),
		last4: z.string(),
		expiry_month: z.number(),
		expiry_year: z.number(),
		card_type: z.enum(["Visa", "Mastercard", "Amex", "Discover", "Diners", "JCB"]),
		avs_street: z.string(),
		avs_zip: z.string(),
		auth_code: z.string(),
		bin: z.string(),
		bin_details: z.object({
			type: z.nullable(z.enum(["C", "D"]))
		}),
		avs_result: z.string(),
		avs_result_code: z.enum(["YYY", "YYX", "NYZ", "YYW", "YNA", "NNN", "XXU", "XXR", "XXS", "GGG", "NNC", "NA"]),
		cvv_result: z.string(),
		cvv_result_code: z.enum(["M", "N", "P", "U", "X"]),
		cavv_result: z.string(),
		cavv_result_code: z.string()
	}),
	avs_result: z.string(),
	avs_result_code: z.enum(["YYY", "YYX", "NYZ", "YYW", "YNA", "NNN", "XXU", "XXR", "XXS", "GGG", "NNC", "NA",]),
	cvv2_result: z.string(),
	cvv2_result_code: z.enum(["M", "N", "P", "U", "X"]),
	card_type: z.enum(["Visa", "MasterCard", "Discover", "Amex", "JCB", "Diners"]),
	last_4: z.string(),
	card_ref: z.string()
});
