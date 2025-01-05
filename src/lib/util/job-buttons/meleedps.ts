import type { RoleParseResult } from '#root/interaction-handlers/select-menus/role';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from 'discord.js';
import { CustomIdPrefixes } from '#lib/util/constants';

export function getMeleeDpsJobButtons(result: RoleParseResult): ActionRowBuilder<ButtonBuilder>[] {
	const samuraiButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-samurai|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558649917575188', name: 'Samurai' })
		.setLabel('Samurai')
		.setStyle(ButtonStyle.Primary);

	const ninjaButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-ninja|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558640878977066', name: 'Ninja' })
		.setLabel('Ninja')
		.setStyle(ButtonStyle.Primary);

	const monkButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-monk|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558638551011340', name: 'Monk' })
		.setLabel('Monk')
		.setStyle(ButtonStyle.Primary);

	const dragoonButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-dragoon|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558631085019226', name: 'Dragoon' })
		.setLabel('Dragoon')
		.setStyle(ButtonStyle.Primary);

	const reaperButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-reaper|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558646423719938', name: 'Reaper' })
		.setLabel('Reaper')
		.setStyle(ButtonStyle.Primary);

	const viperButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.Job}-viper|${result.eventId}|${result.userId}`)
		.setEmoji({ id: '1324558658322960477', name: 'Viper' })
		.setLabel('Viper')
		.setStyle(ButtonStyle.Primary);

	return [
		new ActionRowBuilder<ButtonBuilder>().setComponents(samuraiButton, ninjaButton, monkButton, dragoonButton, reaperButton),
		new ActionRowBuilder<ButtonBuilder>().setComponents(viperButton)
	];
}
