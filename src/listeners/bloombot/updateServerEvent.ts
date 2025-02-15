import type { BloombotEvents, UpdateServerEventPayload } from '#lib/util/constants';
import { $Enums } from '@prisma/client';
import { Listener } from '@sapphire/framework';
import { addHours, getISODay } from 'date-fns';
import { GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, GuildScheduledEventRecurrenceRuleFrequency } from 'discord.js';

export class UserListener extends Listener<typeof BloombotEvents.UpdateServerEvent> {
	public override async run({ eventId, guildId }: UpdateServerEventPayload) {
		const eventData = await this.container.prisma.event.findFirstOrThrow({
			where: {
				id: eventId
			},
			include: {
				instance: {
					include: {
						participants: true
					}
				}
			}
		});

		if (eventData.discordEventId && eventData.instance) {
			const guild = await this.container.client.guilds.fetch(guildId);

			if (guild) {
				const leaderUser = await guild.members.fetch(eventData.leader);

				const response = await guild.scheduledEvents.edit(eventData.discordEventId, {
					name: eventData.name,
					entityType: GuildScheduledEventEntityType.External,
					entityMetadata: { location: 'FC House' },
					privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
					scheduledStartTime: eventData.instance.dateTime,
					scheduledEndTime: addHours(eventData.instance.dateTime, eventData.duration),
					description: eventData.description ?? undefined,
					reason: `Event created by ${leaderUser.user.username}`,
					image: eventData.bannerImage ? Buffer.from(eventData.bannerImage, 'base64') : null,

					...(eventData.interval &&
					(eventData.interval === $Enums.EventInterval.WEEKLY || eventData.interval === $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK)
						? {
								recurrenceRule: {
									startAt: eventData.instance.dateTime.toISOString(),
									frequency: GuildScheduledEventRecurrenceRuleFrequency.Weekly,
									interval: eventData.interval === $Enums.EventInterval.WEEKLY ? 1 : 2,
									byWeekday: [getISODay(eventData.instance.dateTime) - 1]
								}
							}
						: {})
				});

				if (
					eventData.interval &&
					(eventData.interval === $Enums.EventInterval.WEEKLY || eventData.interval === $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK)
				) {
					await this.container.prisma.event.update({
						where: { id: eventId },
						data: { discordEventId: response.id }
					});
				}
			}
		}
	}
}
