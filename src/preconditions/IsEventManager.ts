import { Owners } from '#root/config';
import { Precondition } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { PermissionFlagsBits, type ChatInputCommandInteraction } from 'discord.js';

export class UserPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
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
