import type { RoleParseResult } from '#root/interaction-handlers/select-menus/role';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CustomIdPrefixes } from '#lib/util/constants';

export function getPhysRangedDpsJobButtons(result: RoleParseResult): ActionRowBuilder<ButtonBuilder>[] {
	const machinistButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-machinist|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558636579557518', name: 'Machinist' })
		.setLabel('Machinist')
		.setStyle(ButtonStyle.Primary);

	const dancerButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-dancer|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558625884340336', name: 'Dancer' })
		.setLabel('Dancer')
		.setStyle(ButtonStyle.Primary);

	const bardButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-bard|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558620435943494', name: 'Bard' })
		.setLabel('Bard')
		.setStyle(ButtonStyle.Primary);

	return [new ActionRowBuilder<ButtonBuilder>().setComponents(machinistButton, dancerButton, bardButton)];
}
