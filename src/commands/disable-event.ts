import { XIVEventBuddyCommand } from '#lib/extensions/XIVEventBuddyComand';
import { BrandingColors, ErrorIdentifiers, UpdateEmbedPayloadOrigin, XIVEventBuddyEvents } from '#lib/util/constants';
import { XIVEventBuddyEmojis } from '#lib/util/emojis';
import { resolveOnErrorCodes } from '#lib/util/functions/resolveOnErrorCodes';
import { UserError, type ApplicationCommandRegistry, type Awaitable, type ContextMenuCommand } from '@sapphire/framework';
import { applyNameLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import {
	ApplicationCommandType,
	ApplicationIntegrationType,
	ContainerComponent,
	InteractionContextType,
	MessageFlags,
	RESTJSONErrorCodes,
	type APITextDisplayComponent
} from 'discord.js';

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
					origin: UpdateEmbedPayloadOrigin.DisableEventCommand
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
					const containerComponent = targetMessage.components.at(0);

					if (containerComponent instanceof ContainerComponent) {
						const containerComponentJson = containerComponent.toJSON();
						containerComponentJson.accent_color = BrandingColors.ExpiredEvent;
						const raidLeaderLineComponent = containerComponentJson.components.at(4) as APITextDisplayComponent;
						const dateTimeComponent = containerComponentJson.components.at(5) as APITextDisplayComponent;

						raidLeaderLineComponent.content = raidLeaderLineComponent.content
							.replace(XIVEventBuddyEmojis.Signups, XIVEventBuddyEmojis.SignupsExpired)
							.replace(XIVEventBuddyEmojis.Duration, XIVEventBuddyEmojis.DurationExpired);

						dateTimeComponent.content = dateTimeComponent.content
							.replace(XIVEventBuddyEmojis.Date, XIVEventBuddyEmojis.DateExpired)
							.replace(XIVEventBuddyEmojis.Time, XIVEventBuddyEmojis.TimeExpired)
							.replace(XIVEventBuddyEmojis.Countdown, XIVEventBuddyEmojis.CountdownExpired);

						containerComponentJson.components[4] = raidLeaderLineComponent;
						containerComponentJson.components[5] = dateTimeComponent;

						await resolveOnErrorCodes(
							targetMessage.edit({
								components: [containerComponentJson],
								files: []
							}),
							RESTJSONErrorCodes.UnknownMessage,
							RESTJSONErrorCodes.MissingPermissions
						);
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
