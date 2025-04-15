import { FastifySchema } from 'fastify';

/**
 * Extended FastifySchema interface that includes OpenAPI documentation fields
 * This extends the standard FastifySchema with documentation properties supported 
 * when using @fastify/swagger plugin
 */
export interface FastifySchemaWithDocs extends FastifySchema {
	description?: string;
	tags?: string[];
	summary?: string;
	security?: Array<Record<string, string[]>>;
	deprecated?: boolean;
	consumes?: string[];
	produces?: string[];
	externalDocs?: {
		description?: string;
		url: string;
	};
	body?: unknown;
	querystring?: unknown;
	params?: unknown;
	headers?: unknown;
	response?: unknown;
}
