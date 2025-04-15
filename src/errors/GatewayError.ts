export default class GatewayError extends Error {
	statusCode: number;

	constructor(message: string, statusCode = 500) {
		super(message);
		this.name = this.constructor.name;
		this.statusCode = statusCode;
	}
}
