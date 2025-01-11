import type { ChatInputCommandDeniedPayload, ContextMenuCommandDeniedPayload, UserError } from '@sapphire/framework';
import { MessageFlags } from 'discord.js';

export function handleChatInputOrContextMenuCommandDenied(
	{ message }: UserError,

	{ interaction }: ChatInputCommandDeniedPayload | ContextMenuCommandDeniedPayload
) {
	return interaction.reply({
		content: message,
		allowedMentions: { users: [interaction.user.id], roles: [] },
		flags: MessageFlags.Ephemeral
	});
}
