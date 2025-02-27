/*
	HOW TO INTERPRET THIS FILE?
	THESE TYPES ARE FOR THE REQUEST AND RESPONSES FROM USAePAY. THE REQUIREMENT OF CERTAIN VARIABLES REFLECTS THE DESIGN CHOICE OF REQUIRING IT ON OUR END RATHER THAN WHAT IS REQUIRED BY USAePAY. I RECOMMEND LOOKING THROUGH THE USAePAY DOCUMENTATION AS WELL ;)

	RESOURCES:
	USAePAY: https://help.usaepay.info/api/rest/?shell#sale
*/
export interface CreditCard {
	cardholder: string;
	number: string;
	expiration: string;
	cvc: string;
	avs_street: string;
	avs_postalcode: string;
}

export interface CardToken extends Omit<CreditCard, 'expiration'> {
	// JUST WANT TO OMIT EXPIRATION
};

export interface BillingAddressBase {
	company: string;
	street: string;
	street2: string;
	city: string;
	state: string;
	postalcode: string;
	country: string;
};

export interface BillingAddressName extends BillingAddressBase {
	first_name: string;
	last_name: string;
};

export interface BillingAddressCompany extends BillingAddressBase {
	company: string;
};

export interface CardRequest {
	command: string;
	invoice: string;
	ponum: string;
	orderid: string;
	email: string;
	send_recept: number;
	ignore_duplicate: number;
	merchemailaddr: string;
	amount: number;
	creditcard: CreditCard;
	save_card: boolean;
	custkey: string;
	save_customer: boolean;
	save_customer_paymethod: boolean;
	billing_address: BillingAddressCompany | BillingAddressName;
	custom_fields: {
		action_by: string;
	}
	currency: string;
	software: string;
	receipt_merchemail: string;
}

export interface TokenRequest extends Omit<CardRequest, 'save_card' | 'save_customer' | 'save_customer_paymethod' | 'creditcard'> {
	creditcard: CardToken;
}

export interface CardResponse {
	type: string;
	key: string;
	refnum: string;
	is_duplicate: string;
	result_code: string;
	result: string;
	authcode: string;
	creditcard: {
		number: string;
		cardholder: string;
		category_code: string;
		aid: string;
		entry_mode: string;
	};
	invoice: string;
	avs: {
		result_code: string;
		result: string;
	};
	cvc: {
		result_code: string;
		result: string;
	};
	batch: {
		type: string;
		key: string;
		batchrefnum: number;
		sequence: string;
	};
	customer: any;
	auth_amount: number;
	transtype: number;
	iccdata: string;
	receipts: {
		customer: string;
		merchant: string;
	};
}
