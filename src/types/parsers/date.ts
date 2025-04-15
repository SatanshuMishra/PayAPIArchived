import { z } from "zod";

/**
 * Validates a given month.
 *
 * @description
 * - Must be between 1-12
 *
 * @example
 * 6 // Valid Month
 */
export const expirationMonth = z
	.string()
	.or(z.number())
	.transform((val) => parseInt(val.toString()))
	.refine((val) => val >= 1 && val <= 12);

/**
 * Validates a given year.
 *
 * @description
 * - Must be between 1-12
 *
 * @example
 * 2025 // Valid Month
 */
export const expirationYear = z
	.string()
	.or(z.number())
	.transform((val) => parseInt(val.toString()))
	.refine((val) => {
		const currentYear = new Date().getFullYear();
		return val >= currentYear && val <= currentYear + 80;
	});
