import { CustomIdPrefixes } from '#lib/util/constants';
import type { RoleParseResult } from '#root/interaction-handlers/select-menus/role';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function getTankJobButtons(result: RoleParseResult): ActionRowBuilder<ButtonBuilder>[] {
	const blueMageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Bluemage}-t|${result.eventId}`)
		.setEmoji({ id: '1324558623984189560', name: 'BlueMage' })
		.setLabel('BlueMage')
		.setStyle(ButtonStyle.Danger);

	const darkKnightButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.DarkKnight}|${result.eventId}`)
		.setEmoji({ id: '1324558627230453800', name: 'DarkKnight' })
		.setLabel('DarkKnight')
		.setStyle(ButtonStyle.Primary);

	const gunbreakerButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Gunbreaker}|${result.eventId}`)
		.setEmoji({ id: '1324558631995441244', name: 'Gunbreaker' })
		.setLabel('Gunbreaker')
		.setStyle(ButtonStyle.Primary);

	const paladinButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Paladin}|${result.eventId}`)
		.setEmoji({ id: '1324558643164614676', name: 'Paladin' })
		.setLabel('Paladin')
		.setStyle(ButtonStyle.Primary);

	const warriorButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Warrior}|${result.eventId}`)
		.setEmoji({ id: '1324558658922745887', name: 'Warrior' })
		.setLabel('Warrior')
		.setStyle(ButtonStyle.Primary);

	return [new ActionRowBuilder<ButtonBuilder>().setComponents(warriorButton, paladinButton, gunbreakerButton, darkKnightButton, blueMageButton)];
}
