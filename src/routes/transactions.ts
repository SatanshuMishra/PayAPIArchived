import { FastifyPluginAsync } from "fastify";
// import {
// 	USAePAYCreditDebitRequest,
// 	USAePAYCreditDebitResponse,
// } from "CreditDebitSale";
// import { env } from "../config/env";

const bodyData = {
	command: "sale",
	invoice: "98454685",
	ponum: "af416fsd5",
	description: "Antique Pensieve",
	comments: "Powerful magical object. Use with caution.",
	email: "brian@hogwarts.com",
	send_receipt: 1,
	ignore_duplicate: 1,
	merchemailaddr: "receipts@fandb.net",
	amount: "500.00",
	save_card: true,
	amount_detail: {
		subtotal: "450.00",
		tax: "45.00",
		tip: "5.00",
		discount: "50.00",
		shipping: "50.00",
	},
	creditcard: {
		number: "4444333322221111",
		expiration: "0929",
		cvc: "123",
		avs_street: "1234 Portkey Ave",
		avs_zip: "12345",
	},
	traits: {
		is_debt: false,
		is_bill_pay: false,
		is_recurring: false,
		is_healthcare: false,
		is_cash_advance: false,
	},
	save_customer: true,
	save_customer_paymethod: true,
	billing_address: {
		firstname: "Albus",
		lastname: "Dumbledore",
		street: "123 Astronomy Tower",
		street2: "Suite 1",
		city: "Phoenix",
		state: "CA",
		postalcode: "10005",
		country: "USA",
		phone: "555-253-3673",
		fax: "666-253-3673",
	},
	shipping_address: {
		firstname: "Aberforth",
		lastname: "Dumbledore",
		street: "987 HogsHead St",
		city: "Hogsmead",
		state: "WY",
		postalcode: "30005",
		country: "USA",
		phone: "555-253-3673",
	},
	lineitems: [
		{
			product_key: "ds4bb5ckg059vdn8",
			name: "Antique Pensieve",
			cost: "450.00",
			qty: "1",
			tax_amount: "50.00",
			location_key: "dnyyjc8s2vbz8hb33",
			list_price: "500.00",
		},
	],
	custom_fields: {
		"1": "Gryffindor",
		"2": "Headmaster",
	},
};

const transactions: FastifyPluginAsync = async (fastify) => {
	fastify.post<{ Body: any; Reply: any }>(
		"/transactions",
		async (request) => {
			try {
				const response = await fetch(
					`https://sandbox.usaepay.com/api/v2/transactions`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
							Authorization: `Basic XzRDS256YUp6QWdEMkpEclVDQ1hTMWN2Q01raGY4RUY6czIvYXNkZmFzZGZhc2RmLzQ4MjViZTAyOTUyYzE3NGM1NzQyYTE2ZTY3ZGNlYWUyYzliYmQ4MzY1NzQzNzY0MWUzNDFlMGE5MDZhYmZlZjE=`,
						},
						body: JSON.stringify(bodyData),
					}
				);
				if (!response.ok) {
					throw new Error(`Error: ${response.status}`);
				}
				const data = await response.json();
				return data;
			} catch (error) {
				request.log.error(error);
				throw new Error("Failed to process transaction");
			}
		}
	);
};

export default transactions;
