import { BloombotEvents, type CreateServerEventPayload } from '#lib/util/constants';
import { $Enums } from '@prisma/client';
import { Listener } from '@sapphire/framework';
import { addHours, getISODay } from 'date-fns';
import { type APIGuildScheduledEventRecurrenceRule, type RESTPostAPIGuildScheduledEventJSONBody, Routes } from 'discord-api-types/v10';
import { GuildScheduledEventEntityType, GuildScheduledEventPrivacyLevel, GuildScheduledEventRecurrenceRuleFrequency } from 'discord.js';

export class UserListener extends Listener<typeof BloombotEvents.CreateServerEvent> {
	public override async run({ eventId, guildId, isReschedule }: CreateServerEventPayload) {
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

		// If we're rescheduling an event that already had a discord event, we don't want to create a new one.
		if (isReschedule && eventData.hasDiscordEvent) {
			return;
		}

		if (eventData.instance) {
			// If the provided event datetime is in the past, do not create a Discord server event as that will not be possible.
			if (eventData.instance.dateTime < new Date()) {
				return;
			}

			const guild = await this.container.client.guilds.fetch(guildId);

			if (guild) {
				const leaderUser = await guild.members.fetch(eventData.leader);

				const body: RESTPostAPIGuildScheduledEventJSONBody = {
					name: eventData.name,
					entity_type: GuildScheduledEventEntityType.External,
					entity_metadata: { location: 'FC House' },
					privacy_level: GuildScheduledEventPrivacyLevel.GuildOnly,
					scheduled_start_time: eventData.instance.dateTime.toISOString(),
					scheduled_end_time: addHours(eventData.instance.dateTime, eventData.duration).toISOString(),
					description: eventData.description ?? undefined,

					...(eventData.interval &&
					(eventData.interval === $Enums.EventInterval.WEEKLY || eventData.interval === $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK)
						? {
								recurrence_rule: {
									...this.resolveByWeekday(eventData.interval, eventData.instance.dateTime),
									start: eventData.instance.dateTime.toISOString(),
									frequency: this.resolveFrequency(eventData.interval),
									interval: this.resolveInterval(eventData.interval),
									count: null,
									end: null
								}
							}
						: {})
				};

				await this.container.client.rest.post(Routes.guildScheduledEvents(guildId), {
					body,
					reason: `Event created by ${leaderUser.user.username}`
				});

				if (
					eventData.interval &&
					(eventData.interval === $Enums.EventInterval.WEEKLY || eventData.interval === $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK)
				) {
					await this.container.prisma.event.update({
						where: { id: eventId },
						data: { hasDiscordEvent: true }
					});
				}
			}
		}
	}

	private resolveFrequency(databaseInterval: $Enums.EventInterval): GuildScheduledEventRecurrenceRuleFrequency {
		switch (databaseInterval) {
			case $Enums.EventInterval.WEEKLY:
				return GuildScheduledEventRecurrenceRuleFrequency.Weekly;
			case $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK:
				return GuildScheduledEventRecurrenceRuleFrequency.Weekly;
			default:
				return GuildScheduledEventRecurrenceRuleFrequency.Yearly;
		}
	}

	private resolveInterval(databaseInterval: $Enums.EventInterval): 1 | 2 {
		switch (databaseInterval) {
			case $Enums.EventInterval.WEEKLY:
				return 1;
			case $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK:
				return 2;
			default:
				return 1;
		}
	}

	private resolveByWeekday(databaseInterval: $Enums.EventInterval, dateTime: Date): KeysStartingWithBy<APIGuildScheduledEventRecurrenceRule> {
		switch (databaseInterval) {
			case $Enums.EventInterval.WEEKLY:
			case $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK:
				return { by_weekday: [getISODay(dateTime) - 1], by_month: null, by_month_day: null, by_n_weekday: null, by_year_day: null };
			default:
				return { by_weekday: null, by_month: null, by_month_day: null, by_n_weekday: null, by_year_day: null };
		}
	}
}

type KeysStartingWithBy<T> = {
	[K in keyof T as K extends `by_${string}` ? K : never]: T[K];
};
