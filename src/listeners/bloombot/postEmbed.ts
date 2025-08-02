import type { EventData, PostEmbedPayload, XIVEventBuddyEvents } from '#lib/util/constants';
import { buildEventAttachment } from '#lib/util/functions/buildEventAttachment';
import { buildEventComponents } from '#lib/util/functions/buildEventComponents';
import { buildEventEmbed } from '#lib/util/functions/buildEventEmbed';
import { buildPhantomJobComponent } from '#lib/util/functions/buildPhantomJobComponent';
import { resolveOnErrorCodes } from '#lib/util/functions/resolveOnErrorCodes';
import { $Enums } from '@prisma/client';
import { Listener } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { RESTJSONErrorCodes, roleMention } from 'discord.js';

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
					content: isNullishOrEmpty(eventData.rolesToPing)
						? undefined
						: await resolveKey(interaction!, 'globals:andListValue', {
								value: eventData.rolesToPing.map(roleMention),
								lng: preferredLocale
							}),
					embeds: [
						buildEventEmbed({
							event: eventData as EventData,
							addToCalendarString: await resolveKey(interaction!, 'globals:addToCalendar'),
							durationString: await resolveKey(interaction!, 'globals:duration', {
								count: eventData.duration
							})
						})
					],
					components:
						eventData.variant === $Enums.EventVariant.NORMAL
							? await buildEventComponents(interaction ?? preferredLocale, eventId)
							: await buildPhantomJobComponent(interaction ?? preferredLocale, eventId),
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
