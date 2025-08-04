import type { CreateServerEventPayload, XIVEventBuddyEvents } from '#lib/util/constants';
import { createServerEventOptions } from '#lib/util/functions/createServerEventOptions';
import { resolveOnErrorCodes } from '#lib/util/functions/resolveOnErrorCodes';
import { $Enums } from '@prisma/client';
import { Listener } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord.js';

export class UserListener extends Listener<typeof XIVEventBuddyEvents.CreateServerEvent> {
	public override async run({ interaction, eventId, guildId, isReschedule, discordEventId }: CreateServerEventPayload) {
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

		if (eventData.instance) {
			// If the instance already has a discord event id, we don't want to create a new one.
			if (eventData.instance.discordEventId) {
				return;
			}

			// If the provided event datetime is in the past, do not create a Discord server event as that will not be possible.
			if (eventData.instance.dateTime < new Date()) {
				return;
			}

			if (
				isReschedule &&
				discordEventId &&
				eventData.interval &&
				(eventData.interval === $Enums.EventInterval.WEEKLY || eventData.interval === $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK)
			) {
				await this.container.prisma.event.update({
					where: { id: eventId },
					data: { instance: { update: { discordEventId } } }
				});
				return;
			}

			const guild = await resolveOnErrorCodes(this.container.client.guilds.fetch(guildId), RESTJSONErrorCodes.UnknownGuild);

			if (guild) {
				const leaderUser = await resolveOnErrorCodes(guild.members.fetch(eventData.leader), RESTJSONErrorCodes.UnknownMember);

				const response = await guild.scheduledEvents.create(await createServerEventOptions(eventData, interaction, guild, leaderUser));

				await this.container.prisma.event.update({
					where: { id: eventId },
					data: { instance: { update: { discordEventId: response.id } } }
				});
			}
		}
	}
}
