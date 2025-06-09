import { CustomIdPrefixes, ErrorIdentifiers, UpdateEmbedPayloadOrigin, XIVEventBuddyEvents } from '#lib/util/constants';
import { XIVEventBuddyEmojis } from '#lib/util/emojis';
import { formatPhantomJobName } from '#lib/util/functions/formatPhantomJobName';
import { getFullEventData } from '#lib/util/functions/getFullEventData';
import { $Enums } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, UserError } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { inlineCode, MessageFlags, type StringSelectMenuInteraction } from 'discord.js';

export type PhantomJobParseResult = InteractionHandler.ParseResult<StringSelectMenuHandler>;

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class StringSelectMenuHandler extends InteractionHandler {
	public override async run(interaction: StringSelectMenuInteraction<'cached'>, result: InteractionHandler.ParseResult<this>) {
		this.container.client.emit(XIVEventBuddyEvents.UpdateEmbed, {
			interaction,
			eventId: result.eventId,
			guildId: interaction.guildId,
			origin: UpdateEmbedPayloadOrigin.RoleSelectMenu
		});

		return interaction.editReply({
			content: await resolveKey(interaction, 'interactionHandlers:phantomJobSelectMenu', {
				phantomJobEmoji: XIVEventBuddyEmojis[result.selectedPhantomJob],
				phantomJobName: inlineCode(formatPhantomJobName(result.selectedPhantomJob))
			})
		});
	}

	public override async parse(interaction: StringSelectMenuInteraction) {
		if (!interaction.customId.startsWith(CustomIdPrefixes.PhantomJobSelectMenu)) return this.none();

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [, eventId] = interaction.customId.split('|');

		const eventData = await getFullEventData(eventId);

		if (!eventData?.instance?.id) {
			throw new UserError({
				message: await resolveKey(interaction, 'interactionHandlers:selectMenuUnexpectedError'),
				identifier: ErrorIdentifiers.UnableToFindEventForSelectMenuChoiceError
			});
		}

		const result: { max_signup_order: number | null }[] = await this.container.prisma.$queryRaw/* sql */ `
				SELECT MAX(participants.signup_order) AS max_signup_order
				FROM participants
				WHERE event_instance_id = ${eventData.instance.id}
		`;

		const selectedPhantomJob = interaction.values[0] as $Enums.Jobs;

		await this.container.prisma.participant.upsert({
			where: {
				eventInstanceId_discordId: {
					eventInstanceId: eventData.instance.id,
					discordId: interaction.user.id
				}
			},
			create: {
				eventInstanceId: eventData.instance.id,
				discordId: interaction.user.id,
				job: selectedPhantomJob,
				role: $Enums.Roles.PhantomJob,
				signupOrder: (result.at(0)?.max_signup_order ?? 0) + 1
			},
			update: {
				job: selectedPhantomJob,
				role: $Enums.Roles.PhantomJob
			}
		});

		return this.some({ selectedPhantomJob, eventId });
	}
}
