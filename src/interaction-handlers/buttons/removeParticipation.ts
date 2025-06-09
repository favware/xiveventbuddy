import { CustomIdPrefixes, ErrorIdentifiers, UpdateEmbedPayloadOrigin, XIVEventBuddyEvents } from '#lib/util/constants';
import { getFullEventData } from '#lib/util/functions/getFullEventData';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, UserError } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { MessageFlags, type ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, content: InteractionHandler.ParseResult<this>) {
		return interaction.editReply({ content });
	}

	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!interaction.customId.startsWith(CustomIdPrefixes.RemoveParticipation)) return this.none();

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [, eventId] = interaction.customId.split('|');

		const eventData = await getFullEventData(eventId);

		if (!eventData?.instance?.id) {
			throw new UserError({
				message: await resolveKey(interaction, 'interactionHandlers:unexpectedError'),
				identifier: ErrorIdentifiers.UnableToFindEventForButtonClickError
			});
		}

		const participantExists = await this.container.prisma.participant.findUnique({
			where: {
				eventInstanceId_discordId: {
					eventInstanceId: eventData.instance.id,
					discordId: interaction.user.id
				}
			}
		});

		if (!participantExists) {
			return this.some(await resolveKey(interaction, 'interactionHandlers:removeParticipationNotYetSignedUp'));
		}

		await this.container.prisma.participant.delete({
			where: {
				eventInstanceId_discordId: {
					eventInstanceId: eventData.instance.id,
					discordId: interaction.user.id
				}
			}
		});

		if (eventData.instance.messageId) {
			this.container.client.emit(XIVEventBuddyEvents.UpdateEmbed, {
				interaction,
				eventId,
				guildId: interaction.guildId,
				origin: UpdateEmbedPayloadOrigin.RemoveParticipation
			});
		}

		return this.some(await resolveKey(interaction, 'interactionHandlers:removeParticipationSuccessful'));
	}
}
