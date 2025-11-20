import { ErrorIdentifiers, type EventData, type UpdateEmbedPayload, type XIVEventBuddyEvents } from '#lib/util/constants';
import { buildEventAttachment } from '#lib/util/functions/buildEventAttachment';
import { buildEventComponents } from '#lib/util/functions/buildEventComponents';
import { resolveOnErrorCodes } from '#lib/util/functions/resolveOnErrorCodes';
import { Listener, UserError } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { isNullish, isNullishOrEmpty } from '@sapphire/utilities';
import { MessageFlags, RESTJSONErrorCodes } from 'discord.js';

export class UserListener extends Listener<typeof XIVEventBuddyEvents.UpdateEmbed> {
	public override async run({ interaction, eventId, guildId, origin, shouldDisableEvent = false }: UpdateEmbedPayload) {
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
			const channelWithMessage = await resolveOnErrorCodes(guild.channels.fetch(eventData.channelId), RESTJSONErrorCodes.UnknownChannel);
			const { preferredLocale } = guild;

			if (channelWithMessage?.isSendable() && eventData.instance?.messageId) {
				try {
					const postedMessage = await resolveOnErrorCodes(
						channelWithMessage.messages.fetch(eventData.instance.messageId),
						RESTJSONErrorCodes.UnknownMessage
					);

					if (postedMessage) {
						await postedMessage.edit({
							flags: [MessageFlags.IsComponentsV2],
							components: [
								await buildEventComponents({
									interactionOrLocale: interaction ?? preferredLocale,
									event: {
										bannerImage: eventData.bannerImage,
										channelId: eventData.channelId,
										description: eventData.description,
										duration: eventData.duration,
										id: eventData.id,
										instance: { dateTime: eventData.instance.dateTime, participants: eventData.instance.participants },
										leader: eventData.leader,
										name: eventData.name,
										rolesToPing: eventData.rolesToPing,
										variant: eventData.variant
									} as EventData,
									addToCalendarString: await resolveKey(interaction!, 'globals:addToCalendar', {
										lng: isNullish(interaction) ? preferredLocale : undefined
									}),
									durationString: await resolveKey(interaction!, 'globals:duration', {
										lng: isNullish(interaction) ? preferredLocale : undefined,
										count: eventData.duration
									}),
									shouldDisableEvent
								})
							],
							files: buildEventAttachment(eventData as EventData),
							allowedMentions: { roles: isNullishOrEmpty(eventData.rolesToPing) ? undefined : eventData.rolesToPing }
						});
					}
				} catch (error) {
					console.error(error);
					// If it's already a UserError, just re-throw it as it is likely the error from the else statement
					if (error instanceof UserError) {
						throw error;
					}

					throw new UserError({
						message: await resolveKey(interaction!, 'listeners/updateEmbed:unexpectedError', {
							lng: isNullish(interaction) ? preferredLocale : undefined
						}),
						identifier: ErrorIdentifiers.EventEditMessageFetchFailedError,
						context: {
							origin,
							eventId,
							guildId,
							channelWithMessage,
							eventData,
							error
						}
					});
				}
			}
		}
	}
}
