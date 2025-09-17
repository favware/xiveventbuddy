import { XIVEventBuddyCommand } from '#lib/extensions/XIVEventBuddyComand';
import { ErrorIdentifiers, UpdateEmbedPayloadOrigin, XIVEventBuddyEvents } from '#lib/util/constants';
import { UserError, type ApplicationCommandRegistry, type Awaitable, type ContextMenuCommand } from '@sapphire/framework';
import { applyNameLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { ApplicationCommandType, ApplicationIntegrationType, InteractionContextType } from 'discord.js';

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

			if (!event) {
				throw new UserError({
					identifier: ErrorIdentifiers.DisableEventEventNotFound,
					message: await resolveKey(interaction, 'commands/disable-event:noEventFound')
				});
			}

			this.container.client.emit(XIVEventBuddyEvents.UpdateEmbed, {
				interaction,
				eventId: event.id,
				guildId: event.guildId,
				shouldDisableEvent: true,
				origin: UpdateEmbedPayloadOrigin.DisableOldEventScheduledTask
			});

			return interaction.reply({
				content: await resolveKey(interaction, 'commands/disable-event:success', {
					eventName: event.name
				}),
				ephemeral: true
			});
		}

		throw new UserError({
			identifier: ErrorIdentifiers.DisableEventTriggeredOnUserContextMenu,
			message: await resolveKey(interaction, 'globals:messageOnUserContext')
		});
	}
}
