import { BloombotEvents, ErrorIdentifiers } from '#lib/util/constants';
import { BloombotEmojis } from '#lib/util/emojis';
import { OwnerMentions } from '#root/config';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, UserError } from '@sapphire/framework';
import { MessageFlags, type ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class AutocompleteHandler extends InteractionHandler {
	public override run(interaction: ButtonInteraction) {
		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Successfully removed you from the participants list.`
		});
	}

	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith('remove-participation')) return this.none();

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [, eventId, userId] = interaction.customId.split('|');

		const eventData = await this.container.prisma.event.findFirstOrThrow({
			where: {
				id: eventId
			},
			select: {
				channelId: true,
				createdAt: true,
				description: true,
				id: true,
				interval: true,
				leader: true,
				name: true,
				roleToPing: true,
				updatedAt: true,
				instance: {
					select: {
						eventId: true,
						messageId: true,
						id: true,
						createdAt: true,
						updatedAt: true,
						dateTime: true,
						participants: {
							select: {
								createdAt: true,
								id: true,
								updatedAt: true,
								discordId: true,
								job: true,
								role: true,
								signupOrder: true
							}
						}
					}
				}
			}
		});

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
			this.container.client.emit(BloombotEvents.UpdateEmbed, { eventId, interaction });
		}

		return this.some();
	}
}
