import { XIVEventBuddyCommand } from '#lib/extensions/XIVEventBuddyComand';
import { XIVServers } from '#lib/util/constants';
import { convertToEorzeaTime, getEUServerTime } from '#lib/util/functions/ffxivTime';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry, Awaitable, ChatInputCommand } from '@sapphire/framework';
import { ApplicationIntegrationType, inlineCode, MessageFlags } from 'discord.js';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Get either Eorzea or Light server time'
})
export class SlashCommand extends XIVEventBuddyCommand {
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
						.setDescription('Gets the current server time')
						.addStringOption((builder) =>
							builder //
								.setName('server')
								.setChoices([
									// EU
									{ name: 'Light', value: XIVServers.Light },
									{ name: 'Chaos', value: XIVServers.Chaos },

									// USA
									{ name: 'Aether', value: XIVServers.Aether },
									{ name: 'Crystal', value: XIVServers.Crystal },
									{ name: 'Dynamis', value: XIVServers.Dynamis },
									{ name: 'Primal', value: XIVServers.Primal },

									// OCE
									{ name: 'Materia', value: XIVServers.Materia },

									// JPN
									{ name: 'Elemental', value: XIVServers.Elemental },
									{ name: 'Gaia', value: XIVServers.Gaia },
									{ name: 'Mana', value: XIVServers.Mana },
									{ name: 'Meteor', value: XIVServers.Meteor }
								])
						)
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
		await interaction.deferReply({ ephemeral: true });
		const server = interaction.options.getString('server', true) as XIVServers;

		switch (server) {
			case XIVServers.Light:
			case XIVServers.Chaos:
				return interaction.editReply({
					content: `The current ${server} server time is ${inlineCode(getEUServerTime())}.`
				});
			default:
				// TODO: Support US, OCE, and JPN servers
				return interaction.editReply({
					content: 'That server is not supported yet. Please try again later.'
				});
		}
	}
}
