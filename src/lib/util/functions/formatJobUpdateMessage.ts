import { resolveKey } from '@sapphire/plugin-i18next';
import { inlineCode, type ButtonInteraction } from 'discord.js';

export async function formatJobUpdateMessage(interaction: ButtonInteraction<'cached'>, jobEmoji: string, jobName: string): Promise<string> {
	return resolveKey(interaction, 'interactionHandlers:successfullyUpdatedJob', { jobEmoji, jobName: inlineCode(jobName) });
}
