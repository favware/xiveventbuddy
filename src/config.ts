// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { LogLevel } from '@sapphire/framework';
import { cast } from '@sapphire/utilities';
import type { RedisOptions } from 'bullmq';
import { envParseInteger, envParseString } from '@skyra/env-utilities';
import { ActivityType, GatewayIntentBits, userMention, type ActivitiesOptions, type ClientOptions, type WebhookClientData } from 'discord.js';

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

function parsePresenceActivity(): ActivitiesOptions[] {
	const { CLIENT_PRESENCE_NAME } = process.env;
	if (!CLIENT_PRESENCE_NAME) return [];

	return [
		{
			name: CLIENT_PRESENCE_NAME,
			type: cast<Exclude<ActivityType, ActivityType.Custom>>(envParseString('CLIENT_PRESENCE_TYPE', 'WATCHING'))
		}
	];
}

export function parseRedisOption(): Pick<RedisOptions, 'port' | 'password' | 'host'> {
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
	presence: { activities: parsePresenceActivity() },
	loadDefaultErrorListeners: false,
	logger: { level: envParseString('NODE_ENV') === 'production' ? LogLevel.Info : LogLevel.Debug },
	tasks: {
		bull: {
			connection: {
				...parseRedisOption(),
				db: envParseInteger('REDIS_TASK_DB')
			}
		}
	}
};
