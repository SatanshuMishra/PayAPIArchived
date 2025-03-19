import { fastify } from "fastify";
import CryptoJS from "crypto-js";
import verifyJWT from "@/scripts/verifyJWT";
import getBearerToken from "./scripts/getBearerToken.js";
import GatewayError from "./errors/GatewayError.js";

const app = fastify({
	logger: true,
}).withTypeProvider();

app.addHook("onRequest", async (request, reply) => {
	// DECLARE REQUEST ENDPOINTS TO IGNORE JWT CHECKS ON
	// THIS ENDPOINTS ARE TESTING ENDPOINTS OR ENDPOINTS THAT WON'T HAVE A JWT ASSIGNED TO THEM (.e.g. CREATE JWT)

	const skipAuthPaths = ["/auth/tokens", "/auth/keys"];
	if (skipAuthPaths.some((path) => request.url.startsWith(path))) {
		return;
	}

	try {
		const authHeader = request.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			const error = new GatewayError(
				`Missing or invalid authorization token. Please make sure to include your JWT as part of your authorization header.`
			);
			error.statusCode = 401;
			throw error;
		}

		//@ts-ignore
		const ip = request.ip || request.connection.remoteAddress;
		const userAgent = request.headers["user-agent"] || "";
		const acceptLanguage = request.headers["accept-language"] || "";
		const acceptEncoding = request.headers["accept-encoding"] || "";

		const fingerprint = CryptoJS.SHA256(
			`${userAgent}${acceptLanguage}${acceptEncoding}`
		).toString(CryptoJS.enc.Hex);

		// GET CLIENT CONTEXT INFORMATION
		// THIS INFORMATION INCLUDE THE CLIENT IP AND BROWSER FINGERPRINT. THIS WILL BE USED FOR LOGGING.

		const clientContext = {
			ip,
			fingerprint,
		};

		const token = getBearerToken(authHeader);

		if (token === "null") {
			const error = new GatewayError(
				`Missing or invalid authorization token. Please make sure to include your JWT as part of your authorization header.`
			);
			error.statusCode = 401;
			throw error;
		}

		const requestDetails: {
			path: string;
			method: string;
		} = {
			path: request.url,
			method: request.method,
		};

		console.log(requestDetails);

		await verifyJWT(token, requestDetails, clientContext);
		request.clientContext = clientContext;
	} catch (error: any) {
		console.error("Authentication error:", error.message);
		if (error instanceof GatewayError) {
			throw error;
		}
		return reply.code(401).send({
			error: "Authentication failed",
			message: error.message,
		});
	}
});

//@ts-ignore
app.register(import("./routes/ping/index.js"));
//@ts-ignore
app.register(import("./routes/auth/tokens.js"));
//@ts-ignore
app.register(import("./routes/auth/keys.js"));
//@ts-ignore
app.register(import("./routes/customer/customer.js"));
//@ts-ignore
app.register(import("./routes/customer/paymentMethodExists.js"));
//@ts-ignore
app.register(import("./routes/paymentmethod/card.js"));

export default app;
