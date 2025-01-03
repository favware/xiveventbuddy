import { BloombotEmojis } from '#lib/util/emojis';
import { Precondition } from '@sapphire/framework';
import type { ChatInputCommandInteraction } from 'discord.js';

export class UserPrecondition extends Precondition {
	public override async chatInputRun(interaction: ChatInputCommandInteraction<'cached'>) {
		if (!interaction.guildId) {
			return this.error({
				message: `${BloombotEmojis.RedCross} This command can only be used in servers.`
			});
		}

		const verifiedServers = await this.container.prisma.verifiedServers.findMany({ select: { discordId: true } });

		if (!verifiedServers) {
			return this.error({
				message: `${BloombotEmojis.RedCross} No verified servers found in the database.`
			});
		}

		const verifiedServer = verifiedServers.some((vs) => interaction.guildId === vs.discordId);

		if (!verifiedServer) {
			return this.error({
				message: `${BloombotEmojis.RedCross} This command can only be used in verified servers.`
			});
		}

		return this.ok();
	}
}
