import { BrandingColors, type SendReminderPayload, type XIVEventBuddyEvents } from '#lib/util/constants';
import { Listener } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { ContainerBuilder, hyperlink, MessageFlags, messageLink, roleMention, time, TimestampStyles } from 'discord.js';

export class UserListener extends Listener<typeof XIVEventBuddyEvents.SendReminder> {
	public override async run({ eventId, guildId, reminderChannelId }: SendReminderPayload) {
		const event = await this.container.prisma.event.findFirstOrThrow({
			where: {
				id: eventId
			},
			include: {
				instance: true
			}
		});

		const guild = await this.container.client.guilds.fetch(guildId).catch(() => null);

		if (guild) {
			const reminderChannel = await guild.channels.fetch(reminderChannelId).catch(() => null);
			const { preferredLocale } = guild;

			if (reminderChannel?.isSendable() && event.instance?.messageId) {
				const container = new ContainerBuilder();

				if (!isNullishOrEmpty(event.rolesToPing)) {
					const content = await resolveKey(null!, 'globals:andListValue', {
						value: event.rolesToPing.map(roleMention),
						lng: preferredLocale
					});
					container.addTextDisplayComponents((textDisplay) => textDisplay.setContent(content));
				}

				const eventInstanceMessageUrl = hyperlink(event.name, messageLink(event.channelId, event.instance.messageId, event.guildId));
				const relativeTimeFromNow = time(event.instance.dateTime, TimestampStyles.RelativeTime);

				const containerDescription = await resolveKey(null!, 'listeners/sendReminder:reminderBody', {
					nameWithUrl: eventInstanceMessageUrl,
					relativeTime: relativeTimeFromNow,
					lng: preferredLocale
				});

				container
					.setAccentColor(BrandingColors.Primary)
					.addTextDisplayComponents((textDisplay) => textDisplay.setContent(eventInstanceMessageUrl))
					.addTextDisplayComponents((textDisplay) => textDisplay.setContent(containerDescription));

				await reminderChannel.send({
					flags: [MessageFlags.IsComponentsV2],
					components: [container],
					allowedMentions: { roles: isNullishOrEmpty(event.rolesToPing) ? undefined : event.rolesToPing }
				});
			}
		}
	}
}
