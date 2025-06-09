import { CustomIdPrefixes } from '#lib/util/constants';
import type { RoleParseResult } from '#root/interaction-handlers/select-menus/role';
import { resolveKey } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type StringSelectMenuInteraction } from 'discord.js';

export async function getTankJobButtons(
	interaction: StringSelectMenuInteraction<'cached'>,
	result: RoleParseResult
): Promise<ActionRowBuilder<ButtonBuilder>[]> {
	const blueMageButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Bluemage}-t|${result.eventId}`)
		.setEmoji({ id: '1324558623984189560', name: 'BlueMage' })
		.setLabel(await resolveKey(interaction, 'jobs:bluemage'))
		.setStyle(ButtonStyle.Danger);

	const darkKnightButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.DarkKnight}|${result.eventId}`)
		.setEmoji({ id: '1324558627230453800', name: 'DarkKnight' })
		.setLabel(await resolveKey(interaction, 'jobs:darkknight'))
		.setStyle(ButtonStyle.Primary);

	const gunbreakerButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Gunbreaker}|${result.eventId}`)
		.setEmoji({ id: '1324558631995441244', name: 'Gunbreaker' })
		.setLabel(await resolveKey(interaction, 'jobs:gunbreaker'))
		.setStyle(ButtonStyle.Primary);

	const paladinButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Paladin}|${result.eventId}`)
		.setEmoji({ id: '1324558643164614676', name: 'Paladin' })
		.setLabel(await resolveKey(interaction, 'jobs:paladin'))
		.setStyle(ButtonStyle.Primary);

	const warriorButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Warrior}|${result.eventId}`)
		.setEmoji({ id: '1324558658922745887', name: 'Warrior' })
		.setLabel(await resolveKey(interaction, 'jobs:warrior'))
		.setStyle(ButtonStyle.Primary);

	return [new ActionRowBuilder<ButtonBuilder>().setComponents(warriorButton, paladinButton, gunbreakerButton, darkKnightButton, blueMageButton)];
}
