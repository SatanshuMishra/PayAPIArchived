export default function getBearerToken(authHeader: string): string {
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		throw new Error("Invalid Authorization header");
	}

	const apiKey = authHeader.slice(7);
	return apiKey;
}
