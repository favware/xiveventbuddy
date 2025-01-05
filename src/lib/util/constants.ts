import type { Event, EventInstance, Jobs, Participant } from '@prisma/client';
import type { ChatInputCommand } from '@sapphire/framework';
import type { ButtonInteraction, CacheType, StringSelectMenuInteraction } from 'discord.js';

export const rootFolder = new URL('../../../', import.meta.url);

/**
 * Left-to-right mark character.
 * @see {@link https://en.wikipedia.org/wiki/Left-to-right_mark}
 */
export const leftToRightMark = String.fromCharCode(8206);

/**
 * Braille pattern blank character
 * @see {@link https://en.wikipedia.org/wiki/Braille_Patterns}
 */
export const braillePatternBlank = String.fromCharCode(10240);

export enum BloombotEvents {
	UpdateEmbed = 'updateEmbed'
}

export const enum BrandingColors {
	Primary = 0xbb77ea,
	ExpiredEvent = 0xff0000
}

export const enum ErrorIdentifiers {
	EventEditMessageFetchFailedError = 'EventEditMessageFetchFailedError',
	EventEditPostedMessageUndefinedError = 'EventEditPostedMessageUndefinedError',
	EventEditMessageChannelNotFoundError = 'EventEditMessageChannelNotFoundError',
	UnableToFindEventForButtonClickError = 'UnableToFindEventForButtonClickError',
	UnableToFindEventForSelectMenuChoiceError = 'unableToFindEventForSelectMenuChoiceError',
	UnexpectedRoleSelectMenuChoiceError = 'unexpectedRoleSelectMenuChoiceError'
}

export const enum CustomIdPrefixes {
	Job = 'job',
	RoleSelectMenu = 'role-select-menu',
	RoleBench = 'role-bench',
	RoleLate = 'role-late',
	RoleTentative = 'role-tentative',
	RoleAbsence = 'role-absence',
	RemoveParticipation = 'remove-participation',

	Bluemage = 'bluemage',

	Astrologian = 'astrologian',
	Sage = 'sage',
	Scholar = 'scholar',
	Whitemage = 'whitemage',

	Blackmage = 'blackmage',
	Pictomancer = 'pictomancer',
	Redmage = 'redmage',
	Summoner = 'summoner',

	Dragoon = 'dragoon',
	Monk = 'monk',
	Ninja = 'ninja',
	Reaper = 'reaper',
	Samurai = 'samurai',
	Viper = 'viper',

	Bard = 'bard',
	Dancer = 'dancer',
	Machinist = 'machinist',

	DarkKnight = 'darkknight',
	Gunbreaker = 'gunbreaker',
	Paladin = 'paladin',
	Warrior = 'warrior'
}

export interface UpdateEmbedPayload {
	eventId: string;
	guildId: string;
	userId: string | null;
	shouldDisableEvent?: boolean;
}

export type EventData = Pick<Event, 'id' | 'description' | 'name' | 'roleToPing' | 'leader' | 'channelId'> & {
	instance: Pick<EventInstance, 'dateTime'> & {
		participants: Pick<Participant, 'job' | 'role' | 'discordId' | 'signupOrder'>[];
	};
};

type JobTypeEmojis = 'AllRounder' | 'DPS' | 'Healer' | 'MeleeDPS' | 'MagicRangedDPS' | 'PhysRangedDPS' | 'Tank';
type EventDataEmojis =
	| 'Absence'
	| 'Bench'
	| 'Countdown'
	| 'CountdownExpired'
	| 'Date'
	| 'DateExpired'
	| 'Late'
	| 'Leader'
	| 'Signups'
	| 'SignupsExpired'
	| 'RemoveParticipation'
	| 'Tentative'
	| 'Time'
	| 'TimeExpired';
type OtherEmojis = 'GreenTick' | 'RedCross';

export type Emojis = Jobs | JobTypeEmojis | EventDataEmojis | OtherEmojis;
