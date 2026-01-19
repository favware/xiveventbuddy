import { PermissionFlagsBits, type ChatInputCommandInteraction, type GuildBasedChannel } from 'discord.js';

export function verifyHasSendPermissions(interaction: ChatInputCommandInteraction<'cached'>, channel: GuildBasedChannel) {
	return (
		interaction.guild.members.me &&
		!channel
			.permissionsFor(interaction.guild.members.me)
			?.has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks])
	);
}
