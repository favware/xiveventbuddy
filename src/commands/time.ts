import { BloomCommand } from '#lib/extensions/BloomComand';
import { convertToEorzeaTime, getLightServerTime } from '#lib/util/functions/ffxivTime';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry, Awaitable, ChatInputCommand } from '@sapphire/framework';
import { ApplicationIntegrationType, inlineCode, MessageFlags } from 'discord.js';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Get either Eorzea or Light server time'
})
export class SlashCommand extends BloomCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
		registry.registerChatInputCommand((command) =>
			command //
				.setName(this.name)
				.setDescription(this.description)
				.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
				.addSubcommand((builder) =>
					builder //
						.setName('eorzea')
						.setDescription('Gets the current Eorzea time')
				)
				.addSubcommand((builder) =>
					builder //
						.setName('server')
						.setDescription('Gets the current Light server time')
				)
		);
	}

	public override async chatInputRun(interaction: ChatInputCommand.Interaction<'cached'>) {
		const subcommand = interaction.options.getSubcommand(true) as 'eorzea' | 'server';

		switch (subcommand) {
			case 'eorzea':
				return this.eorzeaTime(interaction);
			case 'server':
				return this.serverTime(interaction);
		}
	}

	private async eorzeaTime(interaction: ChatInputCommand.Interaction<'cached'>) {
		return interaction.reply({
			content: `The current Eorzea time is ${inlineCode(convertToEorzeaTime(new Date()))}.`,
			flags: MessageFlags.Ephemeral
		});
	}

	private async serverTime(interaction: ChatInputCommand.Interaction<'cached'>) {
		return interaction.reply({
			content: `The current Light server time is ${inlineCode(getLightServerTime())}.`,
			flags: MessageFlags.Ephemeral
		});
	}
}
