async function generateEncryptionKey() {
	const jose = await import("jose");

	// Generate a key for encryption (A256GCM is AES-256 in GCM mode)
	const secretKey = await jose.generateSecret('A256GCM', { extractable: true });
	const jwk = await jose.exportJWK(secretKey);

	// Add metadata
	jwk.alg = 'A256GCM';
	jwk.use = 'enc';

	console.log('Store this in your .env file:');
	console.log(`JWT_ENCRYPTION_KEY='${JSON.stringify(jwk)}'`);
}

generateEncryptionKey();
