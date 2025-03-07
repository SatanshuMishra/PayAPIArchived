export interface CreatePaymentMethodResponse {
	/** This `id` is the same as `banquest_payment_id` in the GatewayAPI */
	id: number;
	customer_id: number;
	created_at: number;
	expiry_month: number;
	expiry_year: number;
	payment_method_type: string;
	card_type: string;
	last4: string;
}

