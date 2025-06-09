import { XIVEventBuddyCommand } from '#lib/extensions/XIVEventBuddyComand';
import { ErrorIdentifiers } from '#lib/util/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { UserError, type ApplicationCommandRegistry, type Awaitable, type ChatInputCommand } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ApplicationIntegrationType, MessageFlags, roleMention } from 'discord.js';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Change the settings of the bot'
})
export class SlashCommand extends XIVEventBuddyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
		registry.registerChatInputCommand((builder) =>
			applyLocalizedBuilder(builder, 'commands/settings:root')
				.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
				//  Event managers
				.addSubcommand((builder) =>
					applyLocalizedBuilder(builder, 'commands/settings:addManager') //
						.addRoleOption((builder) => applyLocalizedBuilder(builder, 'commands/settings:role').setRequired(true))
				)
				.addSubcommand((builder) =>
					applyLocalizedBuilder(builder, 'commands/settings:removeManager') //
						.addRoleOption((builder) => applyLocalizedBuilder(builder, 'commands/settings:role').setRequired(true))
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
			throw new UserError({
				message: await resolveKey(interaction, 'commands/settings:checksAlreadyAdded', { role: roleMention(roleToAdd.id) }),
				identifier: ErrorIdentifiers.RoleAlreadyInEventManagers
			});
		}

		await this.container.prisma.eventManagers.create({
			data: {
				discordId: roleToAdd.id
			}
		});

		return interaction.editReply({
			content: await resolveKey(interaction, 'commands/settings:addSuccessful', {
				role: roleMention(roleToAdd.id)
			})
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
			throw new UserError({
				message: await resolveKey(interaction, 'commands/settings:checksNotInTheList', { role: roleMention(roleToRemove.id) }),
				identifier: ErrorIdentifiers.RoleNotInEventManagers
			});
		}

		await this.container.prisma.eventManagers.delete({
			where: {
				discordId: roleToRemove.id
			}
		});

		return interaction.editReply({
			content: await resolveKey(interaction, 'commands/settings:removeSuccessful', { role: roleMention(roleToRemove.id) })
		});
	}
}
