import { BloombotEvents, CustomIdPrefixes, ErrorIdentifiers } from '#lib/util/constants';
import { BloombotEmojis } from '#lib/util/emojis';
import { getFullEventData } from '#lib/util/functions/getFullEventData';
import { OwnerMentions } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, UserError } from '@sapphire/framework';
import { MessageFlags, type ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override run(interaction: ButtonInteraction<'cached'>) {
		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Successfully removed you from the participants list.`
		});
	}

	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!interaction.customId.startsWith(CustomIdPrefixes.RemoveParticipation)) return this.none();

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [, eventId, userId] = interaction.customId.split('|');

		const eventData = await getFullEventData(eventId);

		if (!eventData?.instance?.id) {
			throw new UserError({
				message: `${BloombotEmojis.RedCross} I was unexpectedly unable to find the event matching the click of that button. Contact ${OwnerMentions} for assistance.`,
				identifier: ErrorIdentifiers.UnableToFindEventForButtonClickError
			});
		}

		await this.container.prisma.participant.delete({
			where: {
				eventInstanceId: eventData.instance.id,
				discordId: userId
			}
		});

		if (eventData.instance.messageId) {
			this.container.client.emit(BloombotEvents.UpdateEmbed, { eventId, userId: interaction.user.id, guildId: interaction.guildId });
		}

		return this.some();
	}
}
