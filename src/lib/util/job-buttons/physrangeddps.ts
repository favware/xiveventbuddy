import { CustomIdPrefixes } from '#lib/util/constants';
import type { RoleParseResult } from '#root/interaction-handlers/select-menus/role';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function getPhysRangedDpsJobButtons(result: RoleParseResult): ActionRowBuilder<ButtonBuilder>[] {
	const bardButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Bard}|${result.eventId}`)
		.setEmoji({ id: '1324558620435943494', name: 'Bard' })
		.setLabel('Bard')
		.setStyle(ButtonStyle.Danger);

	const dancerButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Dancer}|${result.eventId}`)
		.setEmoji({ id: '1324558625884340336', name: 'Dancer' })
		.setLabel('Dancer')
		.setStyle(ButtonStyle.Danger);

	const machinistButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Machinist}|${result.eventId}`)
		.setEmoji({ id: '1324558636579557518', name: 'Machinist' })
		.setLabel('Machinist')
		.setStyle(ButtonStyle.Danger);

	return [new ActionRowBuilder<ButtonBuilder>().setComponents(machinistButton, dancerButton, bardButton)];
}
