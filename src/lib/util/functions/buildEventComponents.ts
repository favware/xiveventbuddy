import type { EventData } from '#lib/util/constants';
import { ActionRowBuilder, ButtonBuilder } from 'discord.js';

export function buildEventComponents(event: EventData) {
	const builder = new ActionRowBuilder<ButtonBuilder>();

	return builder;
}
