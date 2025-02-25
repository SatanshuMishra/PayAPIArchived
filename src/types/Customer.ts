export interface Customer {
	key: string;
	type: string;
	customerid: string;
	custid: string;
	street: string;
	street2: string;
	city: string;
	state: string;
	postalcode: string;
	country: string;
	email: string;
	payment_methods: {
		key: string;
		type:string;
		method_name: string;
		expires: string;
		card_type: string;
		ccnum4last: string;
		avs_street: string;
		avs_postalcode: string;
		added: string;
		updated: string;
	}[]
} & (
  | { company: string; first_name?: never; last_name?: never }
  | { first_name: string; last_name: string; company?: never }
);

