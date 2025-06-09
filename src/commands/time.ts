import { XIVEventBuddyCommand } from '#lib/extensions/XIVEventBuddyComand';
import { XIVServers } from '#lib/util/constants';
import { convertToEorzeaTime, getEUServerTime } from '#lib/util/functions/ffxivTime';
import type { ApplicationCommandRegistry, Awaitable, ChatInputCommand } from '@sapphire/framework';
import { applyLocalizedBuilder, createLocalizedChoice, resolveKey } from '@sapphire/plugin-i18next';
import { ApplicationIntegrationType, inlineCode, MessageFlags } from 'discord.js';

export class SlashCommand extends XIVEventBuddyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, 'commands/time:root') //
				.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
				.addSubcommand((builder) => applyLocalizedBuilder(builder, 'commands/time:eorzea'))
				.addSubcommand((builder) =>
					applyLocalizedBuilder(builder, 'commands/time:serverTime') //
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/time:server')
								.setRequired(true)
								.setChoices([
									// EU
									createLocalizedChoice('commands/time:choiceLight', { value: XIVServers.Light }),
									createLocalizedChoice('commands/time:choiceChaos', { value: XIVServers.Chaos }),

									// USA
									createLocalizedChoice('commands/time:choiceAether', { value: XIVServers.Aether }),
									createLocalizedChoice('commands/time:choiceCrystal', { value: XIVServers.Crystal }),
									createLocalizedChoice('commands/time:choiceDynamis', { value: XIVServers.Dynamis }),
									createLocalizedChoice('commands/time:choicePrimal', { value: XIVServers.Primal }),

									// OCE
									createLocalizedChoice('commands/time:choiceMateria', { value: XIVServers.Materia }),

									// JPN
									createLocalizedChoice('commands/time:choiceElemental', { value: XIVServers.Elemental }),
									createLocalizedChoice('commands/time:choiceGaia', { value: XIVServers.Gaia }),
									createLocalizedChoice('commands/time:choiceMana', { value: XIVServers.Mana }),
									createLocalizedChoice('commands/time:choiceMeteor', { value: XIVServers.Meteor })
								])
						)
				)
		);
	}

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
		await interaction.deferReply({ ephemeral: true });
		const server = interaction.options.getString('server', true) as XIVServers;

		switch (server) {
			case XIVServers.Light:
			case XIVServers.Chaos:
				return interaction.editReply({
					content: await resolveKey(interaction, 'commands/time:curerntTimeServer', { server, time: inlineCode(getEUServerTime()) })
				});
			default:
				// TODO: Support US, OCE, and JPN servers
				return interaction.editReply({
					content: await resolveKey(interaction, 'commands/time:serverUnsupported', { server })
				});
		}
	}
}
