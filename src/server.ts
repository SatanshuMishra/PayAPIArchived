import app from "./app";

const start = async () => {
	try {
		const port = 3000;
		await app.listen({ port });
		console.log(`PaymentGateway server is now live ;)! Listening on port ${port}`);
	} catch (error) {
		app.log.error(error);
		process.exit(1);
	}
};

start();
