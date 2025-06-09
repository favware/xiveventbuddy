import type { UpdateServerEventPayload, XIVEventBuddyEvents } from '#lib/util/constants';
import { createServerEventOptions } from '#lib/util/functions/createServerEventOptions';
import { resolveOnErrorCodes } from '#lib/util/functions/resolveOnErrorCodes';
import { Listener } from '@sapphire/framework';
import { RESTJSONErrorCodes } from 'discord.js';

export class UserListener extends Listener<typeof XIVEventBuddyEvents.UpdateServerEvent> {
	public override async run({ interaction, eventId, guildId }: UpdateServerEventPayload) {
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

		if (!eventData.instance?.discordEventId) return null;

		const guild = await resolveOnErrorCodes(this.container.client.guilds.fetch(guildId), RESTJSONErrorCodes.UnknownGuild);

		if (!guild) return null;

		// If the provided event datetime is in the past, do not create a Discord server event as that will not be possible.
		if (eventData.instance.dateTime < new Date()) {
			// If the event is in the past and it had a discord event id, we want to delete it.
			if (eventData.instance.discordEventId) {
				return Promise.all([
					resolveOnErrorCodes(
						guild.scheduledEvents.delete(eventData.instance.discordEventId),
						RESTJSONErrorCodes.UnknownGuildScheduledEvent
					),
					this.container.prisma.event.update({
						where: { id: eventId },
						data: { instance: { update: { discordEventId: null } } }
					})
				]);
			}

			return null;
		}

		const leaderUser = await resolveOnErrorCodes(guild.members.fetch(eventData.leader), RESTJSONErrorCodes.UnknownMember);

		const response = await guild.scheduledEvents.edit(
			eventData.instance.discordEventId,
			await createServerEventOptions(eventData, interaction, guild, leaderUser)
		);

		return await this.container.prisma.event.update({
			where: { id: eventId },
			data: { instance: { update: { discordEventId: response.id } } }
		});
	}
}
