import { CustomIdPrefixes } from '#lib/util/constants';
import type { RoleParseResult } from '#root/interaction-handlers/select-menus/role';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function getMagicDpsJobButtons(result: RoleParseResult): ActionRowBuilder<ButtonBuilder>[] {
	const blackMageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Blackmage}|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558622595879012', name: 'BlackMage' })
		.setLabel('BlackMage')
		.setStyle(ButtonStyle.Danger);

	const blueMageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Bluemage}-d|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558623984189560', name: 'BlueMage' })
		.setLabel('BlueMage')
		.setStyle(ButtonStyle.Danger);

	const pictomancerButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Pictomancer}|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558645505167470', name: 'Pictomancer' })
		.setLabel('Pictomancer')
		.setStyle(ButtonStyle.Danger);

	const redMageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Redmage}|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558648047046708', name: 'RedMage' })
		.setLabel('RedMage')
		.setStyle(ButtonStyle.Danger);

	const summonerButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Summoner}|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558654401282069', name: 'Summoner' })
		.setLabel('Summoner')
		.setStyle(ButtonStyle.Danger);

	return [new ActionRowBuilder<ButtonBuilder>().setComponents(summonerButton, redMageButton, blackMageButton, pictomancerButton, blueMageButton)];
}
