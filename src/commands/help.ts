import { ApplyOptions } from '@sapphire/decorators';
import { Command, type ChatInputCommand } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, chatInputApplicationCommandMention } from 'discord.js';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Provides setup information for getting started with XIVEventBuddy'
})
export class SlashCommand extends Command {
	private readonly settingsCommandMention = chatInputApplicationCommandMention('settings', 'add-manager-role', '1324565167282978908');

	private readonly eventsCommandMention = chatInputApplicationCommandMention('event', 'create', '1384445458705027096');

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) => applyLocalizedBuilder(builder, 'commands/help:root'));
	}

	public override async chatInputRun(interaction: ChatInputCommand.Interaction) {
		return interaction.reply({
			content: await resolveKey(interaction, 'commands/help:content', {
				settingsCommandMention: this.settingsCommandMention,
				eventsCommandMention: this.eventsCommandMention
			}),
			components: await this.getComponents(interaction),
			ephemeral: true
		});
	}

	private async getComponents(interaction: ChatInputCommand.Interaction): Promise<ActionRowBuilder<ButtonBuilder>[]> {
		return [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder() //
					.setStyle(ButtonStyle.Link)
					.setURL('https://discord.gg/sguypX8')
					.setLabel(await resolveKey(interaction, 'globals:supportServer'))
					.setEmoji({
						name: '🆘'
					})
			)
		];
	}
}
