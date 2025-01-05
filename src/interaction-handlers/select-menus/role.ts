import { ErrorIdentifiers, CustomIdPrefixes } from '#lib/util/constants';
import { BloombotEmojis } from '#lib/util/emojis';
import { getFullEventData } from '#lib/util/functions/getFullEventData';
import { getTankJobButtons } from '#lib/util/job-buttons/tank';
import { getHealerJobButtons } from '#lib/util/job-buttons/healer';
import { getMagicDpsJobButtons } from '#lib/util/job-buttons/magicdps';
import { getMeleeDpsJobButtons } from '#lib/util/job-buttons/meleedps';
import { getPhysRangedDpsJobButtons } from '#lib/util/job-buttons/physrangeddps';
import { OwnerMentions } from '#root/config';
import { $Enums } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes, UserError } from '@sapphire/framework';
import { inlineCode, MessageFlags, type ActionRowBuilder, type ButtonBuilder, type StringSelectMenuInteraction } from 'discord.js';

export type RoleParseResult = InteractionHandler.ParseResult<StringSelectMenuHandler>;

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class StringSelectMenuHandler extends InteractionHandler {
	public override run(interaction: StringSelectMenuInteraction, result: InteractionHandler.ParseResult<this>) {
		let components: ActionRowBuilder<ButtonBuilder>[];

		switch (result.selectedRole) {
			case $Enums.Roles.Tank:
				components = getTankJobButtons(result);
				break;
			case $Enums.Roles.MeleeDPS:
				components = getMeleeDpsJobButtons(result);
				break;
			case $Enums.Roles.PhysRangedDPS:
				components = getPhysRangedDpsJobButtons(result);
				break;
			case $Enums.Roles.MagicRangedDPS:
				components = getMagicDpsJobButtons(result);
				break;
			case $Enums.Roles.Healer:
				components = getHealerJobButtons(result);
				break;
			default:
				throw new UserError({
					message: `${BloombotEmojis.RedCross} I received an unexpected role from the select menu of selecting your role. Contact ${OwnerMentions} for assistance.`,
					identifier: ErrorIdentifiers.UnexpectedRoleSelectMenuChoiceError
				});
		}

		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Successfully updated your role to ${inlineCode(result.selectedRole)}. Next, select which job you will be playing from these options:`,
			components
		});
	}

	public override async parse(interaction: StringSelectMenuInteraction) {
		if (!interaction.customId.startsWith(CustomIdPrefixes.RoleSelectMenu)) return this.none();

		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const [, eventId, userId] = interaction.customId.split('|');

		const eventData = await getFullEventData(eventId);

		if (!eventData?.instance?.id) {
			throw new UserError({
				message: `${BloombotEmojis.RedCross} I was unexpectedly unable to find the event matching the selection of that option. Contact ${OwnerMentions} for assistance.`,
				identifier: ErrorIdentifiers.UnableToFindEventForSelectMenuChoiceError
			});
		}

		const maxSignupOrder = await this.container.prisma.participant
			.findMany({
				where: {
					eventInstanceId: eventData.instance.eventId
				},
				select: {
					signupOrder: true
				}
			})
			.then((participants) => participants.map((participant) => participant.signupOrder))
			.then((signupOrders) => {
				if (signupOrders.length === 0) return 0;
				return Math.max(...signupOrders);
			});

		const selectedRole = interaction.values[0] as $Enums.Roles;

		await this.container.prisma.participant.upsert({
			where: {
				eventInstanceId: eventData.instance.id,
				discordId: userId
			},
			create: {
				eventInstanceId: eventData.instance.id,
				discordId: userId,
				job: null,
				role: selectedRole,
				signupOrder: maxSignupOrder + 1
			},
			update: {
				job: null,
				role: selectedRole
			}
		});

		return this.some({ selectedRole, eventId, userId });
	}
}
