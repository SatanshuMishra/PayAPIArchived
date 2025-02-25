export interface CreditCard {
	cardholder: string;
	number: string;
	expiration: string;
	cvc: string;
	avs_street: string;
	avs_postalcode: string;
}

export interface BillingAddress {
	street: string;
	street2: string;
	city: string;
	state: string;
	postalcode: string;
	country: string;
} & (
  | { company: string; first_name?: never; last_name?: never }
  | { first_name: string; last_name: string; company?: never }
);
