import type { Event, EventInstance, Jobs, Participant } from '@prisma/client';

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

export const enum BrandingColors {
	Primary = 0xbb77ea
}

export type EventData = Pick<Event, 'id' | 'description' | 'name' | 'roleToPing' | 'leader'> & {
	instance: Pick<EventInstance, 'dateTime'> & {
		participants: Pick<Participant, 'job' | 'role' | 'discordId' | 'signupOrder'>[];
	};
};

type JobTypeEmojis = 'AllRounder' | 'DPS' | 'Healer' | 'MeleeDPS' | 'MagicRangedDPS' | 'PhysRangedDPS' | 'Tank';
type EventDataEmojis = 'Absence' | 'Bench' | 'Countdown' | 'Date' | 'Late' | 'Leader' | 'Signups' | 'SpecReset' | 'Tentative' | 'Time';
type OtherEmojis = 'GreenTick' | 'RedCross';

export type Emojis = Jobs | JobTypeEmojis | EventDataEmojis | OtherEmojis;
