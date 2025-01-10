import { BloomCommand } from '#lib/extensions/BloomComand';
import { BloombotEmojis } from '#lib/util/emojis';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry, Awaitable, ChatInputCommand } from '@sapphire/framework';
import { ApplicationIntegrationType, inlineCode, MessageFlags, roleMention } from 'discord.js';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Change the settings of the bot'
})
export class SlashCommand extends BloomCommand {
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

				// Verified servers
				.addSubcommand((builder) =>
					builder //
						.setName('add-verified-server')
						.setDescription('Add a server to the list of verified servers')
						.addStringOption((input) =>
							input //
								.setName('server')
								.setDescription('The discord ID of the server to add to the list of verified servers')
								.setRequired(true)
						)
				)
				.addSubcommand((builder) =>
					builder //
						.setName('remove-verified-server')
						.setDescription('Removes a server from the list of verified servers')
						.addRoleOption((input) =>
							input //
								.setName('server')
								.setDescription('The discord ID of the server to remove from the list of verified servers')
								.setRequired(true)
						)
				)
		);
	}

	public override async chatInputRun(interaction: ChatInputCommand.Interaction<'cached'>) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const subcommand = interaction.options.getSubcommand(true) as
			| 'add-manager-role'
			| 'remove-manager-role'
			| 'add-verified-server'
			| 'remove-verified-server';

		switch (subcommand) {
			case 'add-manager-role':
				return this.addManagerRole(interaction);
			case 'remove-manager-role':
				return this.removeManagerRole(interaction);
			case 'add-verified-server':
				return this.addVerifiedServer(interaction);
			case 'remove-verified-server':
				return this.removeVerifiedServer(interaction);
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
				content: `${BloombotEmojis.RedCross} Role ${roleMention(roleToAdd.id)} is already in the list of event managers`
			});
		}

		await this.container.prisma.eventManagers.create({
			data: {
				discordId: roleToAdd.id
			}
		});

		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Role ${roleMention(roleToAdd.id)} has been added to the list of event managers`
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
				content: `${BloombotEmojis.RedCross} Role ${roleMention(roleToRemove.id)} is not in the list of event managers`
			});
		}

		await this.container.prisma.eventManagers.delete({
			where: {
				discordId: roleToRemove.id
			}
		});

		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Role ${roleMention(roleToRemove.id)} has been removed from the list of event managers`
		});
	}

	private async addVerifiedServer(interaction: ChatInputCommand.Interaction<'cached'>) {
		const serverToAdd = interaction.options.getString('server', true);

		const serverAlreadyInList = await this.container.prisma.verifiedServers.findFirst({
			where: {
				discordId: serverToAdd
			}
		});

		if (serverAlreadyInList) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} Server with ID ${inlineCode(serverToAdd)} is already in the list of verified servers`
			});
		}

		await this.container.prisma.verifiedServers.create({
			data: {
				discordId: serverToAdd
			}
		});

		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Server with ID ${inlineCode(serverToAdd)} has been added to the list of verified servers`
		});
	}

	private async removeVerifiedServer(interaction: ChatInputCommand.Interaction<'cached'>) {
		const serverToRemove = interaction.options.getString('server', true);

		const serverInList = await this.container.prisma.verifiedServers.findFirst({
			where: {
				discordId: serverToRemove
			}
		});

		if (!serverInList) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} Server with ID ${inlineCode(serverToRemove)} is not in the list of verified servers`
			});
		}

		await this.container.prisma.verifiedServers.delete({
			where: {
				discordId: serverToRemove
			}
		});

		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Server with ID ${inlineCode(serverToRemove)} has been removed from the list of verified servers`
		});
	}
}
