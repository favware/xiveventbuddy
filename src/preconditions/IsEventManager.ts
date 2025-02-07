



import { BloombotEmojis } from '#lib/util/emojis';
import { Precondition } from '@sapphire/framework';
import { Owners } from '#config';
import type { ChatInputCommandInteraction } from 'discord.js';

export class UserPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
		// Check if the user ID is included in the Owners array
		if (Owners.includes(interaction.user.id)) {
			return this.ok();
		}

		const managers = await this.container.prisma.eventManagers.findMany({ select: { discordId: true } });

		if (!managers) {
			return this.error({ message: `${BloombotEmojis.RedCross} No event managers found in the database` });
		}

		const manager = managers.some((manager) => interaction.member.roles.cache.has(manager.discordId));

		if (!manager) {
			return this.error({ message: `${BloombotEmojis.RedCross} You are not an event manager` });
		}

		return this.ok();
	}
}
