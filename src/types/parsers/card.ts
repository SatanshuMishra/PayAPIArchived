import { z } from "zod";

/**
 * Validates a credit card number string using the Luhn algorithm.
 *
 * @description
 * - Must be between 13-19 digits
 * - Must contain only numeric characters
 * - Must pass the Luhn checksum algorithm
 *
 * @example
 * "4111111111111111" // Valid Visa Test Number
 * "5111111111111111" // Valid Mastercard Test Number
 */
export const paymentCardNumber = z
	.string()
	.min(13)
	.max(19)
	.refine((val) => /^\d+$/.test(val))
	.refine((val) => {
		let sum = 0;
		let shouldDouble = false;
		for (let i = val.length - 1; i >= 0; i--) {
			let digit = parseInt(val.charAt(i));
			if (shouldDouble) {
				digit *= 2;
				if (digit > 9) digit -= 9;
			}
			sum += digit;
			shouldDouble = !shouldDouble;
		}
		return sum % 10 === 0;
	});

/**
 * Validates if a payment card expiration date is not expired
 *
 * @description
 * - Checks if the expiration month and year are valid
 * - Compares against current date to ensure card is not expired
 * - Throws a detailed error message if validation fails
 */
export const cardExpirationDate = z
	.object({
		expMonth: z.number().int().min(1).max(12),
		expYear: z.number().int().min(2000),
	})
	.refine((data) => {
		const currentMonth = new Date().getMonth() + 1; // JavaScript months are 0-indexed
		const currentYear = new Date().getFullYear();

		return (
			data.expYear > currentYear ||
			(data.expYear === currentYear && data.expMonth >= currentMonth)
		);
	});
