import { CustomIdPrefixes, ErrorIdentifiers, UpdateEmbedPayloadOrigin, XIVEventBuddyEvents } from '#lib/util/constants';
import { XIVEventBuddyEmojis } from '#lib/util/emojis';
import { getFullEventData } from '#lib/util/functions/getFullEventData';
import { getHealerJobButtons } from '#lib/util/job-buttons/healer';
import { getMagicDpsJobButtons } from '#lib/util/job-buttons/magicdps';
import { getMeleeDpsJobButtons } from '#lib/util/job-buttons/meleedps';
import { getPhysRangedDpsJobButtons } from '#lib/util/job-buttons/physrangeddps';
import { getTankJobButtons } from '#lib/util/job-buttons/tank';
import { $Enums } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, UserError } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { inlineCode, MessageFlags, type ActionRowBuilder, type ButtonBuilder, type StringSelectMenuInteraction } from 'discord.js';

export type RoleParseResult = InteractionHandler.ParseResult<StringSelectMenuHandler>;

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class StringSelectMenuHandler extends InteractionHandler {
	public override async run(interaction: StringSelectMenuInteraction<'cached'>, result: InteractionHandler.ParseResult<this>) {
		let components: ActionRowBuilder<ButtonBuilder>[] | null;

		switch (result.selectedRole) {
			case $Enums.Roles.Tank:
				components = await getTankJobButtons(interaction, result);
				break;
			case $Enums.Roles.MeleeDPS:
				components = await getMeleeDpsJobButtons(interaction, result);
				break;
			case $Enums.Roles.PhysRangedDPS:
				components = await getPhysRangedDpsJobButtons(interaction, result);
				break;
			case $Enums.Roles.MagicRangedDPS:
				components = await getMagicDpsJobButtons(interaction, result);
				break;
			case $Enums.Roles.Healer:
				components = await getHealerJobButtons(interaction, result);
				break;
			case $Enums.Roles.AllRounder:
				components = null;
				break;
			case $Enums.Roles.Late:
			case $Enums.Roles.Tentative:
			case $Enums.Roles.Absence:
			case $Enums.Roles.Bench:
			case $Enums.Roles.PhantomJob:
				throw new UserError({
					message: await resolveKey(interaction, 'interactionHandlers:roleSelectUnexpectedError'),
					identifier: ErrorIdentifiers.UnexpectedRoleSelectMenuChoiceError
				});
		}

		if (isNullishOrEmpty(components)) {
			this.container.client.emit(XIVEventBuddyEvents.UpdateEmbed, {
				interaction,
				eventId: result.eventId,
				guildId: interaction.guildId,
				origin: UpdateEmbedPayloadOrigin.RoleSelectMenu
			});

			return interaction.editReply({
				content: await resolveKey(interaction, 'interactionHandlers:roleSelectSuccessful', {
					roleEmoji: XIVEventBuddyEmojis[result.selectedRole],
					roleName: inlineCode(result.selectedRole)
				})
			});
		}

		return interaction.editReply({
			content: await resolveKey(interaction, 'interactionHandlers:roleSelectSuccessfulWithJob', {
				roleEmoji: XIVEventBuddyEmojis[result.selectedRole],
				roleName: inlineCode(result.selectedRole)
			}),
			components
		});
	}

	public override async parse(interaction: StringSelectMenuInteraction) {
		if (!interaction.customId.startsWith(CustomIdPrefixes.RoleSelectMenu)) return this.none();

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [, eventId] = interaction.customId.split('|');

		const eventData = await getFullEventData(eventId);

		if (!eventData?.instance?.id) {
			throw new UserError({
				message: await resolveKey(interaction, 'interactionHandlers:selectMenuUnexpectedError'),
				identifier: ErrorIdentifiers.UnableToFindEventForSelectMenuChoiceError
			});
		}

		const result: { max_signup_order: number | null }[] = await this.container.prisma.$queryRaw /* sql */ `
				SELECT MAX(participants.signup_order) AS max_signup_order
				FROM participants
				WHERE event_instance_id = ${eventData.instance.id}
		`;

		const selectedRole = interaction.values[0] as $Enums.Roles;

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
				job: selectedRole === $Enums.Roles.AllRounder ? $Enums.Jobs.AllRounder : null,
				role: selectedRole,
				signupOrder: (result.at(0)?.max_signup_order ?? 0) + 1
			},
			update: {
				job: selectedRole === $Enums.Roles.AllRounder ? $Enums.Jobs.AllRounder : null,
				role: selectedRole
			}
		});

		return this.some({ selectedRole, eventId });
	}
}
