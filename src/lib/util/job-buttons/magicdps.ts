import { CustomIdPrefixes } from '#lib/util/constants';
import type { RoleParseResult } from '#root/interaction-handlers/select-menus/role';
import { resolveKey } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type StringSelectMenuInteraction } from 'discord.js';

export async function getMagicDpsJobButtons(
	interaction: StringSelectMenuInteraction<'cached'>,
	result: RoleParseResult
): Promise<ActionRowBuilder<ButtonBuilder>[]> {
	const blackMageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Blackmage}|${result.eventId}`)
		.setEmoji({ id: '1324558622595879012', name: 'BlackMage' })
		.setLabel(await resolveKey(interaction, 'jobs:blackmage'))
		.setStyle(ButtonStyle.Danger);

	const blueMageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Bluemage}-d|${result.eventId}`)
		.setEmoji({ id: '1324558623984189560', name: 'BlueMage' })
		.setLabel(await resolveKey(interaction, 'jobs:bluemage'))
		.setStyle(ButtonStyle.Danger);

	const pictomancerButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Pictomancer}|${result.eventId}`)
		.setEmoji({ id: '1324558645505167470', name: 'Pictomancer' })
		.setLabel(await resolveKey(interaction, 'jobs:pictomancer'))
		.setStyle(ButtonStyle.Danger);

	const redMageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Redmage}|${result.eventId}`)
		.setEmoji({ id: '1324558648047046708', name: 'RedMage' })
		.setLabel(await resolveKey(interaction, 'jobs:redmage'))
		.setStyle(ButtonStyle.Danger);

	const summonerButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Summoner}|${result.eventId}`)
		.setEmoji({ id: '1324558654401282069', name: 'Summoner' })
		.setLabel(await resolveKey(interaction, 'jobs:summoner'))
		.setStyle(ButtonStyle.Danger);

	return [new ActionRowBuilder<ButtonBuilder>().setComponents(summonerButton, redMageButton, blackMageButton, pictomancerButton, blueMageButton)];
}
