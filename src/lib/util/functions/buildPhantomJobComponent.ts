import { CustomIdPrefixes } from '#lib/util/constants';
import { formatPhantomJobName } from '#lib/util/functions/formatPhantomJobName';
import { getPresenceStateButtons } from '#lib/util/functions/getPresenceStateButtons';
import { $Enums } from '@prisma/client';
import { resolveKey } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import {
	ActionRowBuilder,
	BaseInteraction,
	StringSelectMenuBuilder,
	StringSelectMenuOptionBuilder,
	type ButtonBuilder,
	type Locale
} from 'discord.js';

const PhantomBardOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomBard))
	.setValue($Enums.Jobs.PhantomBard)
	.setEmoji({ id: '1375034095393832991', name: 'PhantomBard' });
const PhantomBerserkerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomBerserker))
	.setValue($Enums.Jobs.PhantomBerserker)
	.setEmoji({ id: '1375034090343895051', name: 'PhantomBerserker' });
const PhantomCannoneerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomCannoneer))
	.setValue($Enums.Jobs.PhantomCannoneer)
	.setEmoji({ id: '1375034085679829043', name: 'PhantomCannoneer' });
const PhantomChemistOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomChemist))
	.setValue($Enums.Jobs.PhantomChemist)
	.setEmoji({ id: '1375034096794996737', name: 'PhantomChemist' });
const PhantomFreelancerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomFreelancer))
	.setValue($Enums.Jobs.PhantomFreelancer)
	.setEmoji({ id: '1375034084694294549', name: 'PhantomFreelancer' });
const PhantomGeomancerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomGeomancer))
	.setValue($Enums.Jobs.PhantomGeomancer)
	.setEmoji({ id: '1375034083427483710', name: 'PhantomGeomancer' });
const PhantomKnightOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomKnight))
	.setValue($Enums.Jobs.PhantomKnight)
	.setEmoji({ id: '1375034086464290920', name: 'PhantomKnight' });
const PhantomMonkOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomMonk))
	.setValue($Enums.Jobs.PhantomMonk)
	.setEmoji({ id: '1375034092160286801', name: 'PhantomMonk' });
const PhantomOracleOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomOracle))
	.setValue($Enums.Jobs.PhantomOracle)
	.setEmoji({ id: '1375034087785500683', name: 'PhantomOracle' });
const PhantomRangerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomRanger))
	.setValue($Enums.Jobs.PhantomRanger)
	.setEmoji({ id: '1375034089186525247', name: 'PhantomRanger' });
const PhantomSamuraiOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomSamurai))
	.setValue($Enums.Jobs.PhantomSamurai)
	.setEmoji({ id: '1375034082249019492', name: 'PhantomSamurai' });
const PhantomThiefOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomThief))
	.setValue($Enums.Jobs.PhantomThief)
	.setEmoji({ id: '1375034080416104519', name: 'PhantomThief' });
const PhantomTimeMageOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomTimeMage))
	.setValue($Enums.Jobs.PhantomTimeMage)
	.setEmoji({ id: '1375034093753864262', name: 'PhantomTimeMage' });

export async function buildPhantomJobComponent(interactionOrLocale: BaseInteraction | Locale, eventId: string, shouldDisableEvent = false) {
	const interactionAsInteraction = interactionOrLocale instanceof BaseInteraction ? interactionOrLocale : null;

	const phantomJobSelectMenu = new StringSelectMenuBuilder().setCustomId(`${CustomIdPrefixes.PhantomJobSelectMenu}|${eventId}`).setOptions(
		PhantomBardOption.setDescription(
			await resolveKey(interactionAsInteraction!, 'components:selectPhantomBard', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		),
		PhantomBerserkerOption.setDescription(
			await resolveKey(interactionAsInteraction!, 'components:selectPhantomBerserker', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		),
		PhantomCannoneerOption.setDescription(
			await resolveKey(interactionAsInteraction!, 'components:selectPhantomCannoneer', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		),
		PhantomChemistOption.setDescription(
			await resolveKey(interactionAsInteraction!, 'components:selectPhantomChemist', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		),
		PhantomFreelancerOption.setDescription(
			await resolveKey(interactionAsInteraction!, 'components:selectPhantomFreelancer', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		),
		PhantomGeomancerOption.setDescription(
			await resolveKey(interactionAsInteraction!, 'components:selectPhantomGeomancer', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		),
		PhantomKnightOption.setDescription(
			await resolveKey(interactionAsInteraction!, 'components:selectPhantomKnight', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		),
		PhantomMonkOption.setDescription(
			await resolveKey(interactionAsInteraction!, 'components:selectPhantomMonk', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		),
		PhantomOracleOption.setDescription(
			await resolveKey(interactionAsInteraction!, 'components:selectPhantomOracle', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		),
		PhantomRangerOption.setDescription(
			await resolveKey(interactionAsInteraction!, 'components:selectPhantomRanger', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		),
		PhantomSamuraiOption.setDescription(
			await resolveKey(interactionAsInteraction!, 'components:selectPhantomSamurai', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		),
		PhantomThiefOption.setDescription(
			await resolveKey(interactionAsInteraction!, 'components:selectPhantomThief', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		),
		PhantomTimeMageOption.setDescription(
			await resolveKey(interactionAsInteraction!, 'components:selectPhantomTimeMage', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		)
	);

	const firstRow = new ActionRowBuilder<StringSelectMenuBuilder>();

	if (shouldDisableEvent) {
		phantomJobSelectMenu.setDisabled(true).setPlaceholder(
			await resolveKey(interactionAsInteraction!, 'components:eventClosed', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		);
		firstRow.setComponents(phantomJobSelectMenu);
		return [firstRow];
	}

	firstRow.setComponents(phantomJobSelectMenu);
	const secondRow = new ActionRowBuilder<ButtonBuilder>().setComponents(await getPresenceStateButtons(interactionOrLocale, eventId));

	return [firstRow, secondRow];
}
