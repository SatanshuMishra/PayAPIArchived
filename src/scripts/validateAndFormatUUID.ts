const regex = /^[0-9a-f]{32}$/i;

export default function validateAndFormatUUID(uuid: string) {
	if (!regex.test(uuid)) return {
		valid: false,
		formattedUUID: null
	}

	const formattedUUID = [
		uuid.slice(0, 8),
		uuid.slice(8, 12),
		uuid.slice(12, 16),
		uuid.slice(16, 20),
		uuid.slice(20)
	].join('-');

	return {
		valid: true,
		formattedUUID
	}
}
