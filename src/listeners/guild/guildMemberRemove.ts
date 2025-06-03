import { BloombotEvents, UpdateEmbedPayloadOrigin } from '#lib/util/constants';
import { type Events, Listener } from '@sapphire/framework';
import { subHours } from 'date-fns';
import type { GuildMember } from 'discord.js';

export class UserListener extends Listener<typeof Events.GuildMemberRemove> {
	public override async run(member: GuildMember) {
		const memberId = member.id;
		const guildId = member.guild.id;
		const now = new Date();

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
				duration: true,
				instance: {
					select: {
						id: true,
						dateTime: true
					}
				}
			}
		});

		const expiredEvents = events.filter((event) => {
			if (!event.instance?.dateTime || typeof event.duration !== 'number') return false;
			const afterDurationOfEvent = subHours(now, event.duration);
			return event.instance.dateTime <= afterDurationOfEvent;
		});

		for (const expiredEvent of expiredEvents) {
			if (!expiredEvent.instance?.id) continue;

			await this.container.prisma.participant.delete({
				where: {
					eventInstanceId_discordId: {
						eventInstanceId: expiredEvent.instance.id,
						discordId: memberId
					}
				}
			});

			this.container.client.emit(BloombotEvents.UpdateEmbed, {
				eventId: expiredEvent.id,
				guildId,
				origin: UpdateEmbedPayloadOrigin.MemberLeaveRemoveParticipation
			});
		}
	}
}
