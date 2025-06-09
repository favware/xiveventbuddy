import { CustomIdPrefixes } from '#lib/util/constants';
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

const TankOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.Tank)
	.setValue($Enums.Roles.Tank)
	.setEmoji({ id: '1324558655202398279', name: 'Tank' });
const MeleeDpsOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.MeleeDPS)
	.setValue($Enums.Roles.MeleeDPS)
	.setEmoji({ id: '1324558637288394869', name: 'MeleeDPS' });
const PhysRangeDpsOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.PhysRangedDPS)
	.setValue($Enums.Roles.PhysRangedDPS)
	.setEmoji({ id: '1324558644448067694', name: 'PhysRangedDPS' });
const MagicOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.MagicRangedDPS)
	.setValue($Enums.Roles.MagicRangedDPS)
	.setEmoji({ id: '1324558639893315625', name: 'MagicRangedDPS' });
const HealerOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.Healer)
	.setValue($Enums.Roles.Healer)
	.setEmoji({ id: '1324558633224114289', name: 'Healer' });
const AllRounderOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.AllRounder)
	.setValue($Enums.Roles.AllRounder)
	.setEmoji({ id: '1324558617193746502', name: 'AllRounder' });

export async function buildEventComponents(interactionOrLocale: BaseInteraction | Locale, eventId: string, shouldDisableEvent = false) {
	const interactionAsInteraction = interactionOrLocale instanceof BaseInteraction ? interactionOrLocale : null;
	const lng = isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined;

	const roleSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleSelectMenu}|${eventId}`)
		.setOptions(
			TankOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectTank', { lng })),
			MeleeDpsOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectMeleeDps', { lng })),
			PhysRangeDpsOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectPhysRangedDps', { lng })),
			MagicOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectMagicRangedDps', { lng })),
			HealerOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectHealer', { lng })),
			AllRounderOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectAllRounder', { lng }))
		);

	const firstRow = new ActionRowBuilder<StringSelectMenuBuilder>();

	if (shouldDisableEvent) {
		roleSelectMenu.setDisabled(true).setPlaceholder(await resolveKey(interactionAsInteraction!, 'components:eventClosed', { lng }));
		firstRow.setComponents(roleSelectMenu);
		return [firstRow];
	}

	firstRow.setComponents(roleSelectMenu);
	const secondRow = new ActionRowBuilder<ButtonBuilder>().setComponents(await getPresenceStateButtons(interactionOrLocale, eventId));

	return [firstRow, secondRow];
}
