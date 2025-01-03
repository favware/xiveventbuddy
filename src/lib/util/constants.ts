import type { Jobs } from '@prisma/client';
import { URL } from 'node:url';

export const rootFolder = new URL('../../../', import.meta.url);
export const srcFolder = new URL('src/', rootFolder);

export const enum BrandingColors {
	Primary = 0xbb77ea
}

export const enum ErrorIdentifiers {}

type JobTypeEmojis = 'AllRounder' | 'DPS' | 'Healer' | 'MeleeDPS' | 'MagicRangedDPS' | 'PhysRangedDPS' | 'Tank';
type EventDataEmojis = 'Absence' | 'Bench' | 'Countdown' | 'Date' | 'Late' | 'Leader' | 'Signups' | 'SpecReset' | 'Tentative' | 'Time';
type OtherEmojis = 'GreenTick' | 'RedCross';

export type Emojis = Jobs | JobTypeEmojis | EventDataEmojis | OtherEmojis;
