import { BloombotEmojis } from '#lib/util/emojis';
import { Precondition } from '@sapphire/framework';
import type { ChatInputCommandInteraction } from 'discord.js';

export class UserPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
		const managers = await this.container.prisma.eventManagers.findMany({ select: { discordId: true } });

		if (!managers) {
			return this.error({ message: `${BloombotEmojis.RedCross} No event managers found in the database` });
		}

		const manager = managers.some((m) => interaction.member.roles.cache.has(m.discordId));

		if (!manager) {
			return this.error({ message: `${BloombotEmojis.RedCross} You are not an event manager` });
		}

		return this.ok();
	}
}
