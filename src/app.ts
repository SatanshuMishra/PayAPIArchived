import { fastify } from 'fastify';

const app = fastify({
	logger: true,
}).withTypeProvider();

app.register(import('./routes/ping'));
app.register(import('./routes/transactions'));
app.register(import('./routes/authenticate'));
app.register(import('./routes/customers'));

export default app;
