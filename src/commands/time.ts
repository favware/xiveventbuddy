import { XIVEventBuddyCommand } from '#lib/extensions/XIVEventBuddyComand';
import { convertToEorzeaTime, getEUServerTime } from '#lib/util/functions/ffxivTime';
import { RegisterChatInputCommand } from '@sapphire/decorators';
import type { ChatInputCommand } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ApplicationIntegrationType, inlineCode, MessageFlags } from 'discord.js';

@RegisterChatInputCommand((builder) =>
	applyLocalizedBuilder(builder, 'commands/time:root') //
		.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
		.addSubcommand((builder) => applyLocalizedBuilder(builder, 'commands/time:eorzea'))
		.addSubcommand((builder) => applyLocalizedBuilder(builder, 'commands/time:serverTime'))
)
export class SlashCommand extends XIVEventBuddyCommand {
	public override async chatInputRun(interaction: ChatInputCommand.Interaction<'cached'>) {
		const subcommand = interaction.options.getSubcommand(true) as 'eorzea' | 'server-time';

		switch (subcommand) {
			case 'eorzea':
				return this.eorzeaTime(interaction);
			case 'server-time':
				return this.serverTime(interaction);
		}
	}

	private async eorzeaTime(interaction: ChatInputCommand.Interaction<'cached'>) {
		return interaction.reply({
			content: await resolveKey(interaction, 'commands/time:currentTimeEorzea', { time: inlineCode(convertToEorzeaTime(new Date())) }),
			flags: MessageFlags.Ephemeral
		});
	}

	private async serverTime(interaction: ChatInputCommand.Interaction<'cached'>) {
		return interaction.reply({
			content: await resolveKey(interaction, 'commands/time:currentTimeServer', {
				time: inlineCode(getEUServerTime())
			}),
			flags: MessageFlags.Ephemeral
		});
	}
}
