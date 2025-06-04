import { XIVEventBuddyEmojis } from '#lib/util/emojis';
import { Owners } from '#root/config';
import { generateUnexpectedErrorMessage, ignoredCodes } from '#utils/functions/errorHelpers';
import { Events, Listener, type ListenerErrorPayload, type Piece, UserError } from '@sapphire/framework';
import { isNullish } from '@sapphire/utilities';
import { DiscordAPIError, HTTPError, type WebhookMessageCreateOptions } from 'discord.js';

export class ListenerError extends Listener<typeof Events.ListenerError> {
	public async run(error: Error, { piece }: ListenerErrorPayload) {
		if (typeof error === 'string') return this.stringError(error);
		if (error instanceof UserError) return this.userError(piece, error);

		const { client, logger } = this.container;

		// If the error was an AbortError or an Internal Server Error, do nothing,
		// because in the infinite knowledge of message reactions and listener
		// errors there is absolutely no way to send a message to the channel that the error originated from.
		// If people complain that their stars aren't being registered then big L for them and they can just
		// use the message context menu command
		if (error.name === 'AbortError' || error.message === 'Internal Server Error') return;

		// Extract useful information about the DiscordAPIError
		if (error instanceof DiscordAPIError || error instanceof HTTPError) {
			if (ignoredCodes.includes(error.status)) {
				return;
			}

			client.emit(Events.Error, error);
		} else {
			logger.warn(this.getWarnError(error, piece));
		}

		// Emit where the error was emitted
		logger.fatal(`[LISTENER] ${piece.location.full}\n${error.stack ?? error.message}`);
		try {
			await this.alert(generateUnexpectedErrorMessage(error));
		} catch (error) {
			client.emit(Events.Error, error as Error);
		}

		return undefined;
	}

	private async stringError(stringError: string) {
		return this.alert(stringError);
	}

	private async userError(piece: Piece, error: UserError) {
		this.container.logger.error(`[LISTENER] ${piece.location.full}\n${error.stack ?? error.message}`);

		try {
			await this.alert(generateUnexpectedErrorMessage(error));
		} catch (error) {
			this.container.client.emit(Events.Error, error as Error);
		}
	}

	private async alert(content: string) {
		const webhook = this.container.webhookError;
		if (isNullish(webhook)) return;

		const payload: WebhookMessageCreateOptions = {
			allowedMentions: { users: Owners }
		};

		if (content.length > 2_000) {
			const file = Buffer.from(content, 'utf8');
			const filename = `error-log.txt`;
			payload.content = `${XIVEventBuddyEmojis.GreenTick} The message content was too long to send. Here is a file with the content.`;
			payload.files = [{ attachment: file, name: filename }];
		} else {
			payload.content = content;
		}

		try {
			await webhook.send(payload);
		} catch (error) {
			this.container.client.emit(Events.Error, error as Error);
		}
	}

	private getWarnError(error: Error, piece: Piece) {
		return `${piece.name} (${piece.location.full}) | ${error.constructor.name}`;
	}
}
