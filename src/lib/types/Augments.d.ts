import type { prismaType } from '#lib/setup/prisma';
import type { BloombotEvents, UpdateEmbedPayload } from '#lib/util/constants';
import type { Nullish } from '@sapphire/utilities';
import type { BooleanString } from '@skyra/env-utilities';
import type { Events, WebhookClient } from 'discord.js';

declare module '@sapphire/pieces' {
	interface Container {
		prisma: prismaType;
		/** The webhook to use for the error event. */
		webhookError: WebhookClient | Nullish;
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		VerifiedServer: never;
		IsEventManager: never;
	}

	interface SapphireClient {
		emit(event: Events.Error, error: Error): boolean;
		emit(event: BloombotEvents.UpdateEmbed, payload: UpdateEmbedPayload): boolean;
	}
}

declare module '@skyra/env-utilities' {
	interface Env {
		CLIENT_ID: string;
		CLIENT_VERSION: string;
		CLIENT_PRESENCE_NAME: string;
		CLIENT_PRESENCE_TYPE: string;

		WEBHOOK_ERROR_ENABLED: BooleanString;
		WEBHOOK_ERROR_ID: string;
		WEBHOOK_ERROR_TOKEN: string;

		DISCORD_TOKEN: string;

		DATABASE_URL: string;
	}
}
