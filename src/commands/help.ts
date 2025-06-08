import { ApplyOptions } from '@sapphire/decorators';
import { Command, type ChatInputCommand } from '@sapphire/framework';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionFlagsBits, chatInputApplicationCommandMention } from 'discord.js';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Provides setup information for getting started with XIVEventBuddy'
})
export class SlashCommand extends Command {
	private readonly settingsCommandMention = chatInputApplicationCommandMention('settings', 'add-manager-role', '1324565167282978908');

	private readonly eventsCommandMention = chatInputApplicationCommandMention('event', 'create', '1325268997981343764');

	private readonly setupContent = [
		`Welcome to XIVEventBuddy! To help you get started here is the breakdown of how this bot works.`,
		'',
		`The first thing you will want to do is use the ${this.settingsCommandMention} to configure the role(s) that will be able to create events with the ${this.eventsCommandMention} command.`,
		'',
		`Until such time only the people with the ${PermissionFlagsBits.Administrator} permission, or the person who is the server owner, will be able to use the bot.`,
		`Note that it is these same people who will be able to use the ${this.settingsCommandMention} command.`,
		'',
		'If you need any further assistance, or you have any other questions, please feel free to join the support server using the button below.'
	].join('\n');

	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) =>
			builder //
				.setName(this.name)
				.setDescription(this.description)
		);
	}

	public override async chatInputRun(interaction: ChatInputCommand.Interaction) {
		return interaction.reply({
			//
			content: this.setupContent,
			components: this.components,
			ephemeral: true
		});
	}

	private get components(): ActionRowBuilder<ButtonBuilder>[] {
		return [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder() //
					.setStyle(ButtonStyle.Link)
					.setURL('https://discord.gg/sguypX8')
					.setLabel('Support server')
					.setEmoji({
						name: '🆘'
					})
			)
		];
	}
}
