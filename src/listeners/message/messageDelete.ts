import { type Events, Listener } from '@sapphire/framework';
import type { Message, OmitPartialGroupDMChannel, PartialMessage } from 'discord.js';

export class UserListener extends Listener<typeof Events.MessageDelete> {
	public override async run(message: OmitPartialGroupDMChannel<Message | PartialMessage>) {
		if (!message.inGuild()) return;

		const messageId = message.id;
		const guildId = message.guild.id;

		const event = await this.container.prisma.event.findFirst({
			where: {
				guildId,
				AND: {
					instance: {
						messageId
					}
				}
			},
			select: {
				id: true
			}
		});

		if (event?.id) {
			await this.container.prisma.event.delete({
				where: {
					id: event.id
				}
			});
		}
	}
}
