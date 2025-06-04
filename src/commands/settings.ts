import { XIVEventBuddyCommand } from '#lib/extensions/XIVEventBuddyComand';
import { XIVEventBuddyEmojis } from '#lib/util/emojis';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry, Awaitable, ChatInputCommand } from '@sapphire/framework';
import { ApplicationIntegrationType, MessageFlags, roleMention } from 'discord.js';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Change the settings of the bot'
})
export class SlashCommand extends XIVEventBuddyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
		registry.registerChatInputCommand((command) =>
			command //
				.setName(this.name)
				.setDescription(this.description)
				.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
				//  Event managers
				.addSubcommand((builder) =>
					builder //
						.setName('add-manager-role')
						.setDescription('Add a role to the list of event managers')
						.addRoleOption((input) =>
							input //
								.setName('role')
								.setDescription('The role to add to the event managers list')
								.setRequired(true)
						)
				)
				.addSubcommand((builder) =>
					builder //
						.setName('remove-manager-role')
						.setDescription('Removes a role from the list of event managers')
						.addRoleOption((input) =>
							input //
								.setName('role')
								.setDescription('The role to remove to the event managers list')
								.setRequired(true)
						)
				)
		);
	}

	public override async chatInputRun(interaction: ChatInputCommand.Interaction<'cached'>) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const subcommand = interaction.options.getSubcommand(true) as 'add-manager-role' | 'remove-manager-role';

		switch (subcommand) {
			case 'add-manager-role':
				return this.addManagerRole(interaction);
			case 'remove-manager-role':
				return this.removeManagerRole(interaction);
		}
	}

	private async addManagerRole(interaction: ChatInputCommand.Interaction<'cached'>) {
		const roleToAdd = interaction.options.getRole('role', true);

		const roleAlreadyInRoles = await this.container.prisma.eventManagers.findFirst({
			where: {
				discordId: roleToAdd.id
			}
		});

		if (roleAlreadyInRoles) {
			return interaction.editReply({
				content: `${XIVEventBuddyEmojis.RedCross} Role ${roleMention(roleToAdd.id)} is already in the list of event managers`
			});
		}

		await this.container.prisma.eventManagers.create({
			data: {
				discordId: roleToAdd.id
			}
		});

		return interaction.editReply({
			content: `${XIVEventBuddyEmojis.GreenTick} Role ${roleMention(roleToAdd.id)} has been added to the list of event managers`
		});
	}

	private async removeManagerRole(interaction: ChatInputCommand.Interaction<'cached'>) {
		const roleToRemove = interaction.options.getRole('role', true);

		const roleInRoles = await this.container.prisma.eventManagers.findFirst({
			where: {
				discordId: roleToRemove.id
			}
		});

		if (!roleInRoles) {
			return interaction.editReply({
				content: `${XIVEventBuddyEmojis.RedCross} Role ${roleMention(roleToRemove.id)} is not in the list of event managers`
			});
		}

		await this.container.prisma.eventManagers.delete({
			where: {
				discordId: roleToRemove.id
			}
		});

		return interaction.editReply({
			content: `${XIVEventBuddyEmojis.GreenTick} Role ${roleMention(roleToRemove.id)} has been removed from the list of event managers`
		});
	}
}
