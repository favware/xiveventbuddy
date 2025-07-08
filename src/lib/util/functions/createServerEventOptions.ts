import { $Enums } from '@prisma/client';
import { resolveKey } from '@sapphire/plugin-i18next';
import { cutText, isNullish } from '@sapphire/utilities';
import { addHours, getISODay } from 'date-fns';
import {
	GuildScheduledEventEntityType,
	GuildScheduledEventPrivacyLevel,
	GuildScheduledEventRecurrenceRuleFrequency,
	type BaseInteraction,
	type CacheType,
	type Guild,
	type GuildMember,
	type GuildScheduledEventCreateOptions
} from 'discord.js';

export async function createServerEventOptions(
	eventData: any,
	interaction: BaseInteraction<CacheType> | null,
	guild: Guild,
	leaderUser: GuildMember | null
): Promise<Promise<GuildScheduledEventCreateOptions>> {
	return {
		name: cutText(eventData.name, 100),
		entityType: GuildScheduledEventEntityType.External,
		entityMetadata: {
			location: await resolveKey(interaction!, 'listeners/createServerEvent:entityMetadata', {
				lng: isNullish(interaction) ? guild.preferredLocale : undefined
			})
		},
		privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
		scheduledStartTime: eventData.instance.dateTime,
		scheduledEndTime: addHours(eventData.instance.dateTime, eventData.duration),
		description: cutText(eventData.description, 1_000) ?? undefined,
		image: eventData.bannerImage ? Buffer.from(eventData.bannerImage, 'base64') : null,

		...(leaderUser?.user.username
			? {
					reason: await resolveKey(interaction!, 'listeners/createServerEvent:eventCreated', {
						user: leaderUser.user.username,
						lng: isNullish(interaction) ? guild.preferredLocale : undefined
					})
				}
			: {}),

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
	};
}
