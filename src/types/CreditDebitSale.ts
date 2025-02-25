import { CreditCard, BillingAddress } from 'CommonTypes';

export interface USAePAYCreditDebitRequest {
	command: string;
	invoice: string;
	ponum: string;
	orderid: string;
	email: string;
	merchemailaddr: string;
	amount: number;
	creditcard: CreditCard;
	save_card: boolean;
	custkey: string;
	save_customer: boolean;
	save_customer_paymethod: boolean;
	billing_address: BillingAddress;
	custom_fields: {
		action_by: string;
	}
	currency: string;
	software: string;
	receipt-merchemail: string;
	ignore_duplicate: boolean;
}

export interface USAePAYCreditDebitResponse {
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
