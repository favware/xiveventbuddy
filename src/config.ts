/* eslint-disable import-x/first */
// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';
import { getPresenceActivity } from '#lib/util/functions/getPresenceActivity';
import { LogLevel } from '@sapphire/framework';
import { envParseInteger, envParseString } from '@skyra/env-utilities';
import type { RedisOptions } from 'bullmq';
import { GatewayIntentBits, userMention, type ClientOptions, type WebhookClientData } from 'discord.js';

export const Owners = ['268792781713965056'];
export const OwnerMentions = Owners.map(userMention);

function parseWebhookError(): WebhookClientData | null {
	const { WEBHOOK_ERROR_TOKEN } = process.env;
	if (!WEBHOOK_ERROR_TOKEN) return null;

	return {
		id: envParseString('WEBHOOK_ERROR_ID'),
		token: WEBHOOK_ERROR_TOKEN
	};
}

export function parseRedisOption(): Pick<RedisOptions, 'host' | 'password' | 'port'> {
	return {
		port: envParseInteger('REDIS_PORT'),
		password: envParseString('REDIS_PASSWORD'),
		host: envParseString('REDIS_HOST')
	};
}

export const WEBHOOK_ERROR = parseWebhookError();

export const CLIENT_OPTIONS: ClientOptions = {
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildScheduledEvents],
	allowedMentions: { users: [], roles: [] },
	presence: { activities: [getPresenceActivity()] },
	loadDefaultErrorListeners: false,
	logger: { level: LogLevel.Debug },
	tasks: {
		bull: {
			connection: {
				...parseRedisOption(),
				db: envParseInteger('REDIS_TASK_DB')
			}
		}
	}
};
