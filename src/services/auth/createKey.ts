import "dotenv/config";
import { GatewayError } from "@/errors";
import { generateApiKey } from "@/scripts/apiKey";

export default async function createToken(
	name: string,
	roleID: number,
	expirationTime = 43800
) {
	try {
		if (!roleID) {
			const error = new GatewayError(
				`Missing required parameters. 'roleID' must be provided.`
			);
			error.statusCode = 400;
			throw error;
		}

		const apiKey = await generateApiKey(name, roleID, expirationTime);

		return apiKey;
	} catch (err) {
		if (err instanceof GatewayError) {
			throw err;
		}

		const error = new GatewayError(`Internal Server Error`);
		error.statusCode = 500;
		throw error;
	}
}
