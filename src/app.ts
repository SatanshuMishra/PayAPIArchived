import { fastify } from 'fastify';
import CryptoJS from 'crypto-js';
import verifyJWT from '@/scripts/verifyJWT';

const app = fastify({
	logger: true,
}).withTypeProvider();

app.addHook('onRequest', async (request, reply) => {
	const skipAuthPaths = ['/auth/tokens', '/auth/keys'];
	if (skipAuthPaths.some(path => request.url.startsWith(path))) {
		return;
	}

	try {
		const authHeader = request.headers.authorization;
		if (!authHeader || !authHeader.startsWith("Bearer ")) {
			return reply.code(401).send({
				error: "Missing or invalid authorization token.",
			});
		}

		const ip = request.ip || request.connection.remoteAddress;
		const userAgent = request.headers["user-agent"] || "";
		const acceptLanguage = request.headers["accept-language"] || "";
		const acceptEncoding = request.headers["accept-encoding"] || "";

		const fingerprint = CryptoJS.SHA256(
			`${userAgent}${acceptLanguage}${acceptEncoding}`
		).toString(CryptoJS.enc.Hex);

		const clientContext = {
			ip,
			fingerprint,
		};

		const token = authHeader.split(" ")[1];

		if (token === "null") {
			return reply.code(401).send({
				message: "Missing authorization token.",
			});
		}

		const requestDetails: {
			path: string;
			method: string;
		} = {
			path: request.url,
			method: request.method
		};

		console.log(requestDetails);

		await verifyJWT(token, requestDetails, clientContext);
		request.clientContext = clientContext;
	} catch (error: any) {
		console.error("Authentication error:", error.message);
		return reply.code(401).send({
			error: "Authentication failed",
			message: error.message
		});
	}
});

//@ts-ignore
app.register(import('./routes/ping/index.js'));
//@ts-ignore
app.register(import('./routes/auth/tokens.js'));
//@ts-ignore
app.register(import('./routes/auth/keys.js'));
//@ts-ignore
app.register(import('./routes/customer/customer.js'));
//@ts-ignore
app.register(import('./routes/customer/paymentMethodExists.js'));
//@ts-ignore
app.register(import('./routes/paymentmethod/card.js'));

export default app;
