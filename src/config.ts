/* eslint-disable import-x/first */
// Unless explicitly defined, set NODE_ENV as development:
process.env.NODE_ENV ??= 'development';

import { XIVEventBuddyEmojis } from '#lib/util/emojis';
import { getPresenceActivity } from '#lib/util/functions/getPresenceActivity';
import { LanguageFormatters, rootFolder } from '#utils/constants';
import { LogLevel } from '@sapphire/framework';
import { i18next, type I18nextFormatter, type InternationalizationOptions } from '@sapphire/plugin-i18next';
import { envParseInteger, envParseString } from '@skyra/env-utilities';
import type { RedisOptions } from 'bullmq';
import {
	GatewayIntentBits,
	inlineCode,
	PermissionFlagsBits,
	time,
	TimestampStyles,
	userMention,
	type ClientOptions,
	type WebhookClientData
} from 'discord.js';
import type { InterpolationOptions } from 'i18next';
import { fileURLToPath } from 'node:url';

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

export const LANGUAGE_ROOT = new URL('src/locales/', rootFolder);

function parseInternationalizationDefaultVariablesPermissions() {
	const keys = Object.keys(PermissionFlagsBits) as readonly (keyof typeof PermissionFlagsBits)[];
	const entries = keys.map((key) => [key, key] as const);

	return Object.fromEntries(entries) as Readonly<Record<keyof typeof PermissionFlagsBits, keyof typeof PermissionFlagsBits>>;
}

function parseInternationalizationDefaultVariables() {
	return {
		GREENTICK: XIVEventBuddyEmojis.GreenTick,
		REDCROSS: XIVEventBuddyEmojis.RedCross,
		...parseInternationalizationDefaultVariablesPermissions()
	};
}

function parseInternationalizationInterpolation(): InterpolationOptions {
	return { escapeValue: false, defaultVariables: parseInternationalizationDefaultVariables() };
}

function parseInternationalizationFormatters(): I18nextFormatter[] {
	// eslint-disable-next-line id-length
	const { t } = i18next;

	return [
		// Add custom formatters:
		{
			name: LanguageFormatters.Number,
			format: (lng, options) => {
				const formatter = new Intl.NumberFormat(lng, { maximumFractionDigits: 2, ...options });
				return (value) => formatter.format(value);
			},
			cached: true
		},
		// Add Discord markdown formatters:
		{ name: LanguageFormatters.Date, format: (value) => time(new Date(value), TimestampStyles.ShortDate) },
		{ name: LanguageFormatters.Time, format: (value) => time(new Date(value), TimestampStyles.ShortTime) },
		{ name: LanguageFormatters.RelativeTime, format: (value) => time(new Date(value), TimestampStyles.RelativeTime) },
		{
			name: LanguageFormatters.InlineCode,
			format: (value) => inlineCode(value)
		},
		// Add alias formatters:
		{
			name: LanguageFormatters.Permissions,
			format: (value, lng, options) => t(`permissions:${value}`, { lng, ...options }) as string
		}
	];
}

function parseInternationalizationOptions(): InternationalizationOptions {
	return {
		defaultMissingKey: 'default',
		defaultNS: 'globals',
		defaultLanguageDirectory: fileURLToPath(LANGUAGE_ROOT),
		fetchLanguage: async ({ interactionGuildLocale, interactionLocale, guild }) =>
			interactionLocale ?? interactionGuildLocale ?? guild?.preferredLocale ?? 'en-US',
		formatters: parseInternationalizationFormatters(),
		i18next: (_: string[], languages: string[]) => ({
			supportedLngs: languages,
			preload: languages,
			returnObjects: true,
			returnEmptyString: false,
			returnNull: false,
			load: 'all',
			lng: 'en-US',
			fallbackLng: {
				'es-419': ['es-ES', 'en-US'], // Latin America Spanish falls back to Spain Spanish
				default: ['en-US']
			},
			defaultNS: 'globals',
			overloadTranslationOptionHandler: (args) => ({ defaultValue: args[1] ?? 'globals:default' }),
			initImmediate: false,
			interpolation: parseInternationalizationInterpolation()
		})
	};
}

export const WEBHOOK_ERROR = parseWebhookError();

export const CLIENT_OPTIONS: ClientOptions = {
	intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildScheduledEvents, GatewayIntentBits.GuildMembers],
	allowedMentions: { users: [], roles: [] },
	presence: { activities: [getPresenceActivity()] },
	loadDefaultErrorListeners: false,
	logger: { level: envParseString('NODE_ENV') === 'production' ? LogLevel.Info : LogLevel.Debug },
	tasks: {
		bull: {
			connection: {
				...parseRedisOption(),
				db: envParseInteger('REDIS_TASK_DB')
			}
		}
	},
	i18n: parseInternationalizationOptions()
};
