import { XIVEventBuddyCommand } from '#lib/extensions/XIVEventBuddyComand';
import { BrandingColors, ErrorIdentifiers, UpdateEmbedPayloadOrigin, XIVEventBuddyEvents } from '#lib/util/constants';
import { XIVEventBuddyEmojis } from '#lib/util/emojis';
import { buildEventComponents } from '#lib/util/functions/buildEventComponents';
import { resolveOnErrorCodes } from '#lib/util/functions/resolveOnErrorCodes';
import { UserError, type ApplicationCommandRegistry, type Awaitable, type ContextMenuCommand } from '@sapphire/framework';
import { applyNameLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ApplicationCommandType, ApplicationIntegrationType, InteractionContextType, MessageFlags, RESTJSONErrorCodes } from 'discord.js';

export class SlashCommand extends XIVEventBuddyCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
		registry.registerContextMenuCommand((builder) =>
			applyNameLocalizedBuilder(builder, 'commands/disable-event:rootName')
				.setType(ApplicationCommandType.Message)
				.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
				.setContexts(InteractionContextType.Guild)
		);
	}

	public override async contextMenuRun(interaction: ContextMenuCommand.Interaction<'cached'>) {
		if (interaction.isMessageContextMenuCommand()) {
			const event = await this.container.prisma.event.findFirst({
				include: {
					instance: true
				},
				where: {
					guildId: interaction.guildId,
					channelId: interaction.channelId,
					instance: {
						messageId: interaction.targetId
					}
				}
			});

			if (event) {
				this.container.client.emit(XIVEventBuddyEvents.UpdateEmbed, {
					interaction,
					eventId: event.id,
					guildId: event.guildId,
					shouldDisableEvent: true,
					origin: UpdateEmbedPayloadOrigin.DisableOldEventScheduledTask
				});

				try {
					await this.container.prisma.event.delete({
						where: {
							id: event.id
						}
					});

					if (event.instance?.discordEventId) {
						await resolveOnErrorCodes(
							interaction.guild.scheduledEvents.delete(event.instance.discordEventId),
							RESTJSONErrorCodes.UnknownGuildScheduledEvent
						);
					}
				} catch {
					return interaction.editReply({
						content: await resolveKey(interaction, 'commands/disable-event:disableUnexpectedError')
					});
				}
			} else {
				const { targetMessage } = interaction;

				if (targetMessage.author?.id === this.container.client.user?.id) {
					const embed = targetMessage.embeds.map((embed) => embed.toJSON()).at(0);

					if (embed) {
						embed.fields?.at(0)?.value.replace(XIVEventBuddyEmojis.Date, XIVEventBuddyEmojis.DateExpired);
						embed.fields?.at(1)?.value.replace(XIVEventBuddyEmojis.Signups, XIVEventBuddyEmojis.SignupsExpired);
						embed.fields?.at(1)?.value.replace(XIVEventBuddyEmojis.Time, XIVEventBuddyEmojis.TimeExpired);
						embed.fields?.at(2)?.value.replace(XIVEventBuddyEmojis.Countdown, XIVEventBuddyEmojis.CountdownExpired);
						embed.fields?.at(3)?.value.replace(XIVEventBuddyEmojis.Duration, XIVEventBuddyEmojis.DurationExpired);
						embed.color = BrandingColors.ExpiredEvent;

						await targetMessage.edit({
							embeds: [embed],
							components: await buildEventComponents(interaction, 'none', true)
						});
					}
				}
			}

			return interaction.reply({
				content: await resolveKey(interaction, 'commands/disable-event:success'),
				flags: MessageFlags.Ephemeral
			});
		}

		throw new UserError({
			identifier: ErrorIdentifiers.DisableEventTriggeredOnUserContextMenu,
			message: await resolveKey(interaction, 'globals:messageOnUserContext')
		});
	}
}
