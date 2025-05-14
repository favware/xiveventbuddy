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
				message: `${BloombotEmojis.RedCross} I was unexpectedly unable to find the event matching the click of that button. Contact ${OwnerMentions} for assistance.`,
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
			return this.some(`${BloombotEmojis.RedCross} You have not yet signed up for participation.`);
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
			this.container.client.emit(BloombotEvents.UpdateEmbed, { eventId, guildId: interaction.guildId });
		}

		return this.some(`${BloombotEmojis.GreenTick} Successfully removed you from the participants list.`);
	}
}
