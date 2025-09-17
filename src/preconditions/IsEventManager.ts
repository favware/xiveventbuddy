import { Owners } from '#root/config';
import { Precondition, type Command } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { PermissionFlagsBits } from 'discord.js';

export class UserPrecondition extends Precondition {
	public override async chatInputRun(interaction: Command.ChatInputCommandInteraction<'cached'>) {
		return this.shared(interaction);
	}

	public override async contextMenuRun(interaction: Command.ContextMenuCommandInteraction<'cached'>) {
		return this.shared(interaction);
	}

	private async shared(interaction: Command.ChatInputCommandInteraction<'cached'> | Command.ContextMenuCommandInteraction<'cached'>) {
		// Check if the user ID is included in the Owners array
		if (Owners.includes(interaction.user.id)) {
			return this.ok();
		}

		// Check if the member is the server owner
		if (interaction.user.id === interaction.guild.ownerId) {
			return this.ok();
		}

		// Check if the member has any role with the Administrator permission
		const hasAdminRole = interaction.member.roles.cache.some((role) => role.permissions.has(PermissionFlagsBits.Administrator));
		if (hasAdminRole) {
			return this.ok();
		}

		const managers = await this.container.prisma.eventManagers.findMany({ select: { discordId: true } });

		if (!managers) {
			return this.error({ message: await resolveKey(interaction, 'preconditions/isEventManager:noEventManagersFound') });
		}

		const manager = managers.some((manager) => interaction.member.roles.cache.has(manager.discordId));

		if (!manager) {
			return this.error({ message: await resolveKey(interaction, 'preconditions/isEventManager:notAnEventManager') });
		}

		return this.ok();
	}
}
