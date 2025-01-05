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
	Primary = 0xbb77ea
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

	Astrologian = 'astrologian',
	Whitemage = 'whitemage',
	Scholar = 'scholar',
	Sage = 'sage',

	Blackmage = 'blackmage',
	Redmage = 'redmage',
	Summoner = 'summoner',

	Monk = 'monk',
	Dragoon = 'dragoon',
	Ninja = 'ninja',
	Samurai = 'samurai',
	Reaper = 'reaper',
	Viper = 'viper',

	Bard = 'bard',
	Machinist = 'machinist',
	Dancer = 'dancer'
}

export interface UpdateEmbedPayload {
	eventId: string;
	interaction: ButtonInteraction<CacheType> | StringSelectMenuInteraction<CacheType> | ChatInputCommand.Interaction<'cached'>;
}

export type EventData = Pick<Event, 'id' | 'description' | 'name' | 'roleToPing' | 'leader' | 'channelId'> & {
	instance: Pick<EventInstance, 'dateTime'> & {
		participants: Pick<Participant, 'job' | 'role' | 'discordId' | 'signupOrder'>[];
	};
};

type JobTypeEmojis = 'AllRounder' | 'DPS' | 'Healer' | 'MeleeDPS' | 'MagicRangedDPS' | 'PhysRangedDPS' | 'Tank';
type EventDataEmojis = 'Absence' | 'Bench' | 'Countdown' | 'Date' | 'Late' | 'Leader' | 'Signups' | 'RemoveParticipation' | 'Tentative' | 'Time';
type OtherEmojis = 'GreenTick' | 'RedCross';

export type Emojis = Jobs | JobTypeEmojis | EventDataEmojis | OtherEmojis;
