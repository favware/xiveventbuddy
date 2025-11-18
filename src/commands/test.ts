// Guide: https://discordjs.guide/legacy/popular-topics/display-components

import { BrandingColors } from '#lib/util/constants';
import { Command, type ApplicationCommandRegistry, type Awaitable, type ChatInputCommand } from '@sapphire/framework';
import { ContainerBuilder, MessageFlags, TextDisplayBuilder } from 'discord.js';

export class SlashCommand extends Command {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
		registry.registerChatInputCommand((builder) => builder.setName('test'));
	}

	public override async chatInputRun(interaction: ChatInputCommand.Interaction<'cached'>) {
		const exampleTextDisplay = new TextDisplayBuilder().setContent(
			'This text is inside a Text Display component! You can use **any __markdown__** available inside this component too.'
		);
		const exampleContainer = new ContainerBuilder().setAccentColor(BrandingColors.Primary).addSectionComponents((section) =>
			section.addTextDisplayComponents(
				(textDisplay) => textDisplay.setContent('Here goes the event title'),
				(textDisplay) => textDisplay.setContent('Here goes the event description')
			)
		);
		return interaction.reply({
			flags: [MessageFlags.IsComponentsV2]
		});
	}
}
