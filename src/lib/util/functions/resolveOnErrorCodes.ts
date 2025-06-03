import { type RESTJSONErrorCodes, DiscordAPIError } from 'discord.js';

export async function resolveOnErrorCodes<T>(promise: Promise<T>, ...codes: readonly RESTJSONErrorCodes[]) {
	try {
		return await promise;
	} catch (error) {
		console.warn('Error instance type: ', (error as Error).constructor.name);
		if (error instanceof DiscordAPIError) {
			console.warn('DiscordAPIError caught in resolveOnErrorCodes with code:', error.code);
		}

		if (error instanceof DiscordAPIError && codes.includes(error.code as RESTJSONErrorCodes)) return null;

		throw error;
	}
}
