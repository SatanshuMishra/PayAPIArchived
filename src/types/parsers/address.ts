import { z } from "zod";

/**
 * Validates a given postal code.
 *
 * @description
 * - Must be a string that is 6 characters long
 *
 * @example
 * "240004" // Valid Postal Code
 */
export const postalCode = z.string().min(6).max(6);
