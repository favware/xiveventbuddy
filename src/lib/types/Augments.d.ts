import type { prismaType } from '#lib/setup/prisma';
import type {
	CreateServerEventPayload,
	PostEmbedPayload,
	UpdateEmbedPayload,
	UpdateServerEventPayload,
	XIVEventBuddyEvents
} from '#lib/util/constants';
import type { Nullish } from '@sapphire/utilities';
import type { BooleanString, IntegerString } from '@skyra/env-utilities';
import type { Events, WebhookClient } from 'discord.js';

declare module '@sapphire/pieces' {
	interface Container {
		prisma: prismaType;
		/**
		 * The webhook to use for the error event.
		 */
		webhookError: Nullish | WebhookClient;
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		IsEventManager: never;
		VerifiedServer: never;
	}

	interface SapphireClient {
		emit(event: Events.Error, error: Error): boolean;
		emit(event: XIVEventBuddyEvents.CreateServerEvent, payload: CreateServerEventPayload): boolean;
		emit(event: XIVEventBuddyEvents.UpdateServerEvent, payload: UpdateServerEventPayload): boolean;
		emit(event: XIVEventBuddyEvents.PostEmbed, payload: PostEmbedPayload): boolean;
		emit(event: XIVEventBuddyEvents.UpdateEmbed, payload: UpdateEmbedPayload): boolean;
	}
}

declare module '@skyra/env-utilities' {
	interface Env {
		BOTLIST_ME_TOKEN: string;
		DATABASE_URL: string;
		DISCORDS_TOKEN: string;
		DISCORD_BOT_LIST_TOKEN: string;
		DISCORD_TOKEN: string;
		REDIS_HOST: string;
		REDIS_PASSWORD: string;

		REDIS_PORT: IntegerString;
		REDIS_TASK_DB: IntegerString;
		TOP_GG_TOKEN: string;

		WEBHOOK_ERROR_ENABLED: BooleanString;

		WEBHOOK_ERROR_ID: string;

		WEBHOOK_ERROR_TOKEN: string;
	}
}
