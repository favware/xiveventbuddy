import type { RoleParseResult } from '#root/interaction-handlers/select-menus/role';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CustomIdPrefixes } from '#lib/util/constants';

export function getTankJobButtons(result: RoleParseResult): ActionRowBuilder<ButtonBuilder>[] {
	const warriorButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-warrior|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558658922745887', name: 'Warrior' })
		.setLabel('Warrior')
		.setStyle(ButtonStyle.Primary);

	const paladinButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-paladin|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558643164614676', name: 'Paladin' })
		.setLabel('Paladin')
		.setStyle(ButtonStyle.Primary);

	const gunbreakerButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-gunbreaker|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558631995441244', name: 'Gunbreaker' })
		.setLabel('Gunbreaker')
		.setStyle(ButtonStyle.Primary);

	const darkKnightButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-darkknight|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558627230453800', name: 'DarkKnight' })
		.setLabel('DarkKnight')
		.setStyle(ButtonStyle.Primary);

	const blueMageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-bluemage-t|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558623984189560', name: 'BlueMage' })
		.setLabel('BlueMage')
		.setStyle(ButtonStyle.Danger);

	return [new ActionRowBuilder<ButtonBuilder>().setComponents(warriorButton, paladinButton, gunbreakerButton, darkKnightButton, blueMageButton)];
}
