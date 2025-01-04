import type { ChatInputCommandDeniedPayload, ContextMenuCommandDeniedPayload, UserError } from '@sapphire/framework';
import { MessageFlags } from 'discord.js';

export function handleChatInputOrContextMenuCommandDenied(
	{ context, message: content }: UserError,

	{ interaction }: ChatInputCommandDeniedPayload | ContextMenuCommandDeniedPayload
) {
	if (Reflect.get(Object(context), 'silent')) return;

	return interaction.reply({
		content,
		allowedMentions: { users: [interaction.user.id], roles: [] },
		flags: MessageFlags.Ephemeral
	});
}
