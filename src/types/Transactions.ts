export interface Transaction {
	amount: number;
	amount_details: {
		tax: number;
		surcharge: number;
		shipping: number;
		tip: number;
		discount: number;
	};
	name: string;
	transaction_details: {
		description: string;
		clerk: string;
		terminal: string;
		client_ip: string;
		signature: string;
		invoice_number: string;
		po_number: string;
		order_number: string;
	};
	line_items: Array<{
		sku: string;
		name: string;
		description: string;
		cost: number;
		quantity: number;
		tax_rate: number;
		tax_amount: number;
		unit_of_measure: string;
		commodity_code: string;
		discount_rate: number;
		discount_amount: number;
	}>;
	billing_info: {
		first_name: string;
		last_name: string;
		street: string;
		street2: string;
		state: string;
		city: string;
		zip: string;
		country: string;
		phone: string;
	};
	shipping_info: {
		first_name: string;
		last_name: string;
		street: string;
		street2: string;
		state: string;
		city: string;
		zip: string;
		country: string;
		phone: string;
	};
	custom_fields: {
		custom1: string;
		custom2: string;
		custom3: string;
		custom4: string;
		custom5: string;
		custom6: string;
		custom7: string;
		custom8: string;
		custom9: string;
		custom10: string;
		custom11: string;
		custom12: string;
		custom13: string;
		custom14: string;
		custom15: string;
		custom16: string;
		custom17: string;
		custom18: string;
		custom19: string;
		custom20: string;
	};
	ignore_duplicates: boolean;
	customer: {
		send_receipt: boolean;
		email: string;
		fax: string;
		identifier: string;
		customer_id: number;
	};
	transaction_flags: {
		allow_partial_approval: boolean;
		is_recurring: boolean;
		is_installment: boolean;
		is_customer_initiated: boolean;
		cardholder_present: boolean;
		card_present: boolean;
		terminal: {
			operating_environment: number;
			cardholder_authentication_method: string;
			cardholder_authentication_entity: number;
			print_capability: boolean;
		};
	};
	avs_address: string;
	avs_zip: string;
	expiry_month: number;
	expiry_year: number;
	cvv2: string;
	"3d_secure": {
		eci: string;
		cavv: string;
		ds_trans_id: string;
	};
	card: string;
	capture: boolean;
	save_card: boolean;
}
