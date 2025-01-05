import { BloombotEvents, ErrorIdentifiers, type EventData, type UpdateEmbedPayload } from '#lib/util/constants';
import { BloombotEmojis } from '#lib/util/emojis';
import { buildEventComponents } from '#lib/util/functions/buildEventComponents';
import { buildEventEmbed } from '#lib/util/functions/buildEventEmbed';
import { OwnerMentions } from '#root/config';
import { Listener, UserError } from '@sapphire/framework';
import { roleMention } from 'discord.js';

export class UserListener extends Listener<typeof BloombotEvents.UpdateEmbed> {
	public override async run({ eventId, guildId, userId, shouldDisableEvent = false }: UpdateEmbedPayload) {
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

		const guild = await this.container.client.guilds.fetch(guildId);

		if (guild) {
			const channelWithMessage = await guild.channels.fetch(eventData.channelId);

			if (channelWithMessage?.isSendable() && eventData.instance?.messageId) {
				try {
					const postedMessage = await channelWithMessage.messages.fetch(eventData.instance.messageId);

					if (postedMessage) {
						await postedMessage.edit({
							content: eventData.roleToPing ? roleMention(eventData.roleToPing) : undefined,
							embeds: [
								buildEventEmbed(
									{
										id: eventData.id,
										description: eventData.description,
										name: eventData.name,
										roleToPing: eventData.roleToPing,
										leader: eventData.leader,
										channelId: eventData.channelId,
										instance: { dateTime: eventData.instance.dateTime, participants: eventData.instance.participants }
									} as EventData,
									shouldDisableEvent
								)
							],
							components: buildEventComponents(eventData.id, userId ?? eventData.leader, shouldDisableEvent),
							allowedMentions: { roles: eventData.roleToPing ? [eventData.roleToPing] : undefined }
						});
					} else {
						throw new UserError({
							message: `${BloombotEmojis.RedCross} I was unexpectedly unable to posted event message. Contact ${OwnerMentions} for assistance.`,
							identifier: ErrorIdentifiers.EventEditPostedMessageUndefinedError
						});
					}
				} catch (error) {
					throw new UserError({
						message: `${BloombotEmojis.RedCross} I was unexpectedly unable to posted event message. Contact ${OwnerMentions} for assistance.`,
						identifier: ErrorIdentifiers.EventEditMessageFetchFailedError
					});
				}
			} else {
				throw new UserError({
					message: `${BloombotEmojis.RedCross} I was unexpectedly unable to find the channel the event was posted in. Contact ${OwnerMentions} for assistance.`,
					identifier: ErrorIdentifiers.EventEditMessageChannelNotFoundError
				});
			}
		}
	}
}
