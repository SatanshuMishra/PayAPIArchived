import { z } from "zod";

export const cardNumberSchema = z
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

export const expMonthSchema = z
	.string()
	.or(z.number())
	.transform((val) => parseInt(val.toString()))
	.refine((val) => val >= 1 && val <= 12);

export const expYearSchema = z
	.string()
	.or(z.number())
	.transform((val) => parseInt(val.toString()))
	.refine((val) => {
		const currentYear = new Date().getFullYear();
		return val >= currentYear && val <= currentYear + 20;
	});

export const avsPostalCodeSchema = z.string().min(6).max(6);
