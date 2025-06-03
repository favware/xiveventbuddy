import { BloombotEvents, UpdateEmbedPayloadOrigin } from '#lib/util/constants';
import { type Events, Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';

export class UserListener extends Listener<typeof Events.GuildMemberRemove> {
	public override async run(member: GuildMember) {
		const memberId = member.id;
		const guildId = member.guild.id;

		const events = await this.container.prisma.event.findMany({
			where: {
				guildId,
				AND: {
					instance: {
						participants: {
							some: {
								discordId: memberId
							}
						}
					}
				}
			},
			select: {
				id: true,
				instance: {
					select: {
						id: true
					}
				}
			}
		});

		await Promise.all(
			events.map(async (entry) => {
				if (!entry.instance?.id) return;

				return this.container.prisma.participant.delete({
					where: {
						eventInstanceId_discordId: {
							eventInstanceId: entry.instance.id,
							discordId: memberId
						}
					}
				});
			})
		);

		for (const event of events) {
			this.container.client.emit(BloombotEvents.UpdateEmbed, {
				eventId: event.id,
				guildId,
				origin: UpdateEmbedPayloadOrigin.MemberLeaveRemoveParticipation
			});
		}
	}
}
