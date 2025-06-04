import { XIVEventBuddyEmojis } from '#lib/util/emojis';
import { inlineCode } from 'discord.js';

export function formatJobUpdateMessage(jobEmoji: string, jobName: string): string {
	return `${XIVEventBuddyEmojis.GreenTick} Successfully updated your job to ${jobEmoji} ${inlineCode(jobName)}.`;
}
