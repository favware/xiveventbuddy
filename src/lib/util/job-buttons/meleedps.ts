import { CustomIdPrefixes } from '#lib/util/constants';
import type { RoleParseResult } from '#root/interaction-handlers/select-menus/role';
import { resolveKey } from '@sapphire/plugin-i18next';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, type StringSelectMenuInteraction } from 'discord.js';

export async function getMeleeDpsJobButtons(
	interaction: StringSelectMenuInteraction<'cached'>,
	result: RoleParseResult
): Promise<ActionRowBuilder<ButtonBuilder>[]> {
	const dragoonButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Dragoon}|${result.eventId}`)
		.setEmoji({ id: '1324558631085019226', name: 'Dragoon' })
		.setLabel(await resolveKey(interaction, 'jobs:dragoon'))
		.setStyle(ButtonStyle.Danger);

	const monkButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Monk}|${result.eventId}`)
		.setEmoji({ id: '1324558638551011340', name: 'Monk' })
		.setLabel(await resolveKey(interaction, 'jobs:monk'))
		.setStyle(ButtonStyle.Danger);

	const ninjaButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Ninja}|${result.eventId}`)
		.setEmoji({ id: '1324558640878977066', name: 'Ninja' })
		.setLabel(await resolveKey(interaction, 'jobs:ninja'))
		.setStyle(ButtonStyle.Danger);

	const reaperButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Reaper}|${result.eventId}`)
		.setEmoji({ id: '1324558646423719938', name: 'Reaper' })
		.setLabel(await resolveKey(interaction, 'jobs:reaper'))
		.setStyle(ButtonStyle.Danger);

	const samuraiButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Samurai}|${result.eventId}`)
		.setEmoji({ id: '1324558649917575188', name: 'Samurai' })
		.setLabel(await resolveKey(interaction, 'jobs:samurai'))
		.setStyle(ButtonStyle.Danger);

	const viperButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Viper}|${result.eventId}`)
		.setEmoji({ id: '1324558658322960477', name: 'Viper' })
		.setLabel(await resolveKey(interaction, 'jobs:viper'))
		.setStyle(ButtonStyle.Danger);

	return [
		new ActionRowBuilder<ButtonBuilder>().setComponents(samuraiButton, ninjaButton, monkButton, dragoonButton, reaperButton),
		new ActionRowBuilder<ButtonBuilder>().setComponents(viperButton)
	];
}
