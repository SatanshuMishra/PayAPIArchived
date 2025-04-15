export const getCardType = (cardNumber: string): "V" | "M" | "U" =>
	/^4/.test(cardNumber)
		? "V"
		: /^(5[1-5]|222[1-9]|22[3-9]|2[3-6]|27[0-1]|2720)/.test(cardNumber)
			? "M"
			: "U";
