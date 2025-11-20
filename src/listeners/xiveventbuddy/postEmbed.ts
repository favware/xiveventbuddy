import type { EventData, PostEmbedPayload, XIVEventBuddyEvents } from '#lib/util/constants';
import { buildEventAttachment } from '#lib/util/functions/buildEventAttachment';
import { buildEventComponents } from '#lib/util/functions/buildEventComponents';
import { resolveOnErrorCodes } from '#lib/util/functions/resolveOnErrorCodes';
import { Listener } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { isNullish, isNullishOrEmpty } from '@sapphire/utilities';
import { MessageFlags, RESTJSONErrorCodes } from 'discord.js';

export class UserListener extends Listener<typeof XIVEventBuddyEvents.PostEmbed> {
	public override async run({ interaction, eventId, guildId }: PostEmbedPayload) {
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

		const guild = await resolveOnErrorCodes(this.container.client.guilds.fetch(guildId), RESTJSONErrorCodes.UnknownGuild);

		if (guild) {
			const eventChannel = await resolveOnErrorCodes(guild.channels.fetch(eventData.channelId), RESTJSONErrorCodes.UnknownChannel);
			const { preferredLocale } = guild;

			if (eventChannel?.isSendable()) {
				const postedMessage = await eventChannel.send({
					flags: [MessageFlags.IsComponentsV2],
					components: [
						await buildEventComponents({
							interactionOrLocale: interaction ?? preferredLocale,
							event: eventData as EventData,
							addToCalendarString: await resolveKey(interaction!, 'globals:addToCalendar', {
								lng: isNullish(interaction) ? preferredLocale : undefined
							}),
							durationString: await resolveKey(interaction!, 'globals:duration', {
								lng: isNullish(interaction) ? preferredLocale : undefined,
								count: eventData.duration
							})
						})
					],
					files: buildEventAttachment(eventData as EventData),
					allowedMentions: { roles: isNullishOrEmpty(eventData.rolesToPing) ? undefined : eventData.rolesToPing }
				});

				await this.container.prisma.event.update({
					where: { id: eventId },
					data: { instance: { update: { messageId: postedMessage.id } } }
				});
			}
		}
	}
}
