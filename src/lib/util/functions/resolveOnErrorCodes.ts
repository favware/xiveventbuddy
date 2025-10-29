import { container } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { type RESTJSONErrorCodes, bold, DiscordAPIError, Events } from 'discord.js';

export async function resolveOnErrorCodes<T>(promise: Promise<T>, ...codes: readonly RESTJSONErrorCodes[]) {
	try {
		return await promise;
	} catch (error) {
		if (error instanceof DiscordAPIError && codes.includes(error.code as RESTJSONErrorCodes)) {
			return null;
		}

		await sendCodesToErrorWebhook(codes, error instanceof DiscordAPIError ? [error.code as RESTJSONErrorCodes] : []);

		throw error;
	}
}

async function sendCodesToErrorWebhook(codes: readonly RESTJSONErrorCodes[], errorCodes: RESTJSONErrorCodes[]) {
	const webhook = container.webhookError;
	if (isNullish(webhook)) return;

	const content = [
		bold('Ignored Error Caught'),
		'',
		`Resolved Promise failed with ignored error codes: ${codes.join(', ')}`,
		`Error codes received: ${errorCodes.join(', ')}`
	].join('\n');

	try {
		await webhook.send({ content });
	} catch (error_) {
		container.client.emit(Events.Error, error_ as Error);
	}
}
