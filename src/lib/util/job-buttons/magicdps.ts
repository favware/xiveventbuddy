import type { RoleParseResult } from '#root/interaction-handlers/select-menus/role';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CustomIdPrefixes } from '#lib/util/constants';

export function getMagicDpsJobButtons(result: RoleParseResult): ActionRowBuilder<ButtonBuilder>[] {
	const summonerButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-summoner|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558654401282069', name: 'Summoner' })
		.setLabel('Summoner')
		.setStyle(ButtonStyle.Primary);

	const redMageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-redmage|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558648047046708', name: 'RedMage' })
		.setLabel('RedMage')
		.setStyle(ButtonStyle.Primary);

	const blackMageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-blackmage|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558622595879012', name: 'BlackMage' })
		.setLabel('BlackMage')
		.setStyle(ButtonStyle.Primary);

	const pictomancerButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-pictomancer|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558645505167470', name: 'Pictomancer' })
		.setLabel('Pictomancer')
		.setStyle(ButtonStyle.Primary);

	const blueMageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-bluemage-d|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558623984189560', name: 'BlueMage' })
		.setLabel('BlueMage')
		.setStyle(ButtonStyle.Danger);

	return [new ActionRowBuilder<ButtonBuilder>().setComponents(summonerButton, redMageButton, blackMageButton, pictomancerButton, blueMageButton)];
}
