import { CustomIdPrefixes } from '#lib/util/constants';
import type { RoleParseResult } from '#root/interaction-handlers/select-menus/role';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function getHealerJobButtons(result: RoleParseResult): ActionRowBuilder<ButtonBuilder>[] {
	const whiteMageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Whitemage}|${result.eventId}`)
		.setEmoji({ id: '1324558660285759538', name: 'WhiteMage' })
		.setLabel('WhiteMage')
		.setStyle(ButtonStyle.Success);

	const scholarButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Scholar}|${result.eventId}`)
		.setEmoji({ id: '1324558651414810836', name: 'Scholar' })
		.setLabel('Scholar')
		.setStyle(ButtonStyle.Success);

	const astrologianButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Astrologian}|${result.eventId}`)
		.setEmoji({ id: '1324558618640646146', name: 'Astrologian' })
		.setLabel('Astrologian')
		.setStyle(ButtonStyle.Success);

	const sageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Sage}|${result.eventId}`)
		.setEmoji({ id: '1324558649015664783', name: 'Sage' })
		.setLabel('Sage')
		.setStyle(ButtonStyle.Success);

	const blueMageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Bluemage}-h|${result.eventId}`)
		.setEmoji({ id: '1324558623984189560', name: 'BlueMage' })
		.setLabel('BlueMage')
		.setStyle(ButtonStyle.Danger);

	return [new ActionRowBuilder<ButtonBuilder>().setComponents(whiteMageButton, scholarButton, astrologianButton, sageButton, blueMageButton)];
}
