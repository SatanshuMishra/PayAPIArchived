import { z } from "zod";

const uuidSchema = z.string()
	.regex(/^[0-9a-f]{32}$/i, "UUID must be a 32-character hexadecimal string")
	.transform(uuid => {
		// Format UUID with hyphens
		return [
			uuid.slice(0, 8),
			uuid.slice(8, 12),
			uuid.slice(12, 16),
			uuid.slice(16, 20),
			uuid.slice(20)
		].join('-');
	});

/**
 * Validates and formats a given UUID.
 * Throws an error if validation fails.
 * 
 * @param uuid - The UUID that needs validation and formatting
 * @returns The formatted UUID with hyphens
 *
 * @example
 * checkUUID("e24b55ba3f624d3aa3c34ab1cad8adc2") // Returns "e24b55ba-3f62-4d3a-a3c3-4ab1cad8adc2"
 */
export function checkUUID(uuid: string): string {
	return uuidSchema.parse(uuid);
}
