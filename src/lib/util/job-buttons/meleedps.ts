import { CustomIdPrefixes } from '#lib/util/constants';
import type { RoleParseResult } from '#root/interaction-handlers/select-menus/role';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';

export function getMeleeDpsJobButtons(result: RoleParseResult): ActionRowBuilder<ButtonBuilder>[] {
	const dragoonButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Dragoon}|${result.eventId}`)
		.setEmoji({ id: '1324558631085019226', name: 'Dragoon' })
		.setLabel('Dragoon')
		.setStyle(ButtonStyle.Danger);

	const monkButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Monk}|${result.eventId}`)
		.setEmoji({ id: '1324558638551011340', name: 'Monk' })
		.setLabel('Monk')
		.setStyle(ButtonStyle.Danger);

	const ninjaButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Ninja}|${result.eventId}`)
		.setEmoji({ id: '1324558640878977066', name: 'Ninja' })
		.setLabel('Ninja')
		.setStyle(ButtonStyle.Danger);

	const reaperButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Reaper}|${result.eventId}`)
		.setEmoji({ id: '1324558646423719938', name: 'Reaper' })
		.setLabel('Reaper')
		.setStyle(ButtonStyle.Danger);

	const samuraiButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Samurai}|${result.eventId}`)
		.setEmoji({ id: '1324558649917575188', name: 'Samurai' })
		.setLabel('Samurai')
		.setStyle(ButtonStyle.Danger);

	const viperButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Viper}|${result.eventId}`)
		.setEmoji({ id: '1324558658322960477', name: 'Viper' })
		.setLabel('Viper')
		.setStyle(ButtonStyle.Danger);

	return [
		new ActionRowBuilder<ButtonBuilder>().setComponents(samuraiButton, ninjaButton, monkButton, dragoonButton, reaperButton),
		new ActionRowBuilder<ButtonBuilder>().setComponents(viperButton)
	];
}
