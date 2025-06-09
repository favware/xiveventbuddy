import { CustomIdPrefixes } from '#lib/util/constants';
import { resolveKey } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import { BaseInteraction, ButtonBuilder, ButtonStyle, type Locale } from 'discord.js';

export async function getPresenceStateButtons(interactionOrLocale: BaseInteraction | Locale, eventId: string) {
	const interactionAsInteraction = interactionOrLocale instanceof BaseInteraction ? interactionOrLocale : null;

	const benchButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleBench}|${eventId}`)
		.setEmoji({ id: '1324558621530521681', name: 'Bench' })
		.setLabel(
			await resolveKey(interactionAsInteraction!, 'components:labelBench', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		)
		.setStyle(ButtonStyle.Secondary);
	const lateButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleLate}|${eventId}`)
		.setEmoji({ id: '1324558634243457117', name: 'Late' })
		.setLabel(
			await resolveKey(interactionAsInteraction!, 'components:labelLate', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		)
		.setStyle(ButtonStyle.Secondary);
	const tentativeButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleTentative}|${eventId}`)
		.setEmoji({ id: '1324558656326467616', name: 'Tentative' })
		.setLabel(
			await resolveKey(interactionAsInteraction!, 'components:labelTentative', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		)
		.setStyle(ButtonStyle.Secondary);
	const absenceButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleAbsence}|${eventId}`)
		.setEmoji({ id: '1324558615939649559', name: 'Absence' })
		.setLabel(
			await resolveKey(interactionAsInteraction!, 'components:labelAbsence', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		)
		.setStyle(ButtonStyle.Secondary);
	const removeParticipationButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RemoveParticipation}|${eventId}`)
		.setEmoji({ id: '1325255133592031272', name: 'RemoveParticipation' })
		.setLabel(
			await resolveKey(interactionAsInteraction!, 'components:labelRemoveParticipation', {
				lng: isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined
			})
		)
		.setStyle(ButtonStyle.Secondary);

	return [benchButton, lateButton, tentativeButton, absenceButton, removeParticipationButton];
}
