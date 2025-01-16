import type { Event, EventInstance, Jobs, Participant } from '@prisma/client';

export const rootFolder = new URL('../../../', import.meta.url);

/**
 * Left-to-right mark character.
 *
 * @see {@link https://en.wikipedia.org/wiki/Left-to-right_mark}
 */
export const leftToRightMark = String.fromCodePoint(8_206);

/**
 * Braille pattern blank character
 *
 * @see {@link https://en.wikipedia.org/wiki/Braille_Patterns}
 */
export const braillePatternBlank = String.fromCodePoint(10_240);

export enum BloombotEvents {
	CreateServerEvent = 'createServerEvent',
	PostEmbed = 'postEmbed',
	UpdateEmbed = 'updateEmbed'
}

export const enum BrandingColors {
	Primary = 0xbb77ea,
	ExpiredEvent = 0xff0000
}

export const enum ErrorIdentifiers {
	EventBannerImageDownloadError = 'EventBannerImageDownloadError',
	EventEditIdNotFound = 'EventEditIdNotFound',
	EventEditMessageChannelNotFoundError = 'EventEditMessageChannelNotFoundError',
	EventEditMessageFetchFailedError = 'EventEditMessageFetchFailedError',
	EventEditPostedMessageUndefinedError = 'EventEditPostedMessageUndefinedError',
	UnableToFindEventForButtonClickError = 'UnableToFindEventForButtonClickError',
	UnableToFindEventForSelectMenuChoiceError = 'unableToFindEventForSelectMenuChoiceError',
	UnexpectedRoleSelectMenuChoiceError = 'unexpectedRoleSelectMenuChoiceError'
}

/* eslint-disable typescript-sort-keys/string-enum */
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
/* eslint-enable typescript-sort-keys/string-enum */

export interface CreateServerEventPayload {
	eventId: string;
	guildId: string;
	isReschedule: boolean;
}

export interface PostEmbedPayload {
	eventId: string;
	guildId: string;
}

export interface UpdateEmbedPayload {
	eventId: string;
	guildId: string;
	shouldDisableEvent?: boolean;
}

export type EventData = Pick<Event, 'bannerImage' | 'channelId' | 'description' | 'id' | 'leader' | 'name' | 'roleToPing'> & {
	instance: Pick<EventInstance, 'dateTime'> & {
		participants: Pick<Participant, 'discordId' | 'job' | 'role' | 'signupOrder'>[];
	};
};

type JobTypeEmojis = 'AllRounder' | 'DPS' | 'Healer' | 'MagicRangedDPS' | 'MeleeDPS' | 'PhysRangedDPS' | 'Tank';
type EventDataEmojis =
	| 'Absence'
	| 'Bench'
	| 'Countdown'
	| 'CountdownExpired'
	| 'Date'
	| 'DateExpired'
	| 'Late'
	| 'Leader'
	| 'RemoveParticipation'
	| 'Signups'
	| 'SignupsExpired'
	| 'Tentative'
	| 'Time'
	| 'TimeExpired';
type OtherEmojis = 'GreenTick' | 'RedCross';

export type Emojis = EventDataEmojis | Jobs | JobTypeEmojis | OtherEmojis;
