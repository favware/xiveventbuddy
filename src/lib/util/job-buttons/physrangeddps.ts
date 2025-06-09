import { CustomIdPrefixes } from '#lib/util/constants';
import type { RoleParseResult } from '#root/interaction-handlers/select-menus/role';
import { resolveKey } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type StringSelectMenuInteraction } from 'discord.js';

export async function getPhysRangedDpsJobButtons(
	interaction: StringSelectMenuInteraction<'cached'>,
	result: RoleParseResult
): Promise<ActionRowBuilder<ButtonBuilder>[]> {
	const bardButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Bard}|${result.eventId}`)
		.setEmoji({ id: '1324558620435943494', name: 'Bard' })
		.setLabel(await resolveKey(interaction, 'jobs:bard'))
		.setStyle(ButtonStyle.Danger);

	const dancerButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Dancer}|${result.eventId}`)
		.setEmoji({ id: '1324558625884340336', name: 'Dancer' })
		.setLabel(await resolveKey(interaction, 'jobs:dancer'))
		.setStyle(ButtonStyle.Danger);

	const machinistButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Machinist}|${result.eventId}`)
		.setEmoji({ id: '1324558636579557518', name: 'Machinist' })
		.setLabel(await resolveKey(interaction, 'jobs:machinist'))
		.setStyle(ButtonStyle.Danger);

	return [new ActionRowBuilder<ButtonBuilder>().setComponents(machinistButton, dancerButton, bardButton)];
}
