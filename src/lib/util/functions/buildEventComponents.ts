import { CustomIdPrefixes } from '#lib/util/constants';
import { $Enums } from '@prisma/client';
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } from 'discord.js';

const TankOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.Tank)
	.setValue($Enums.Roles.Tank)
	.setEmoji({ id: '1324558655202398279', name: 'Tank' })
	.setDescription('Select this option if you are a Tank.');
const MeleeDpsOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.MeleeDPS)
	.setValue($Enums.Roles.MeleeDPS)
	.setEmoji({ id: '1324558637288394869', name: 'MeleeDPS' })
	.setDescription('Select this option if you are a Melee DPS.');
const PhysRangeDpsOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.PhysRangedDPS)
	.setValue($Enums.Roles.PhysRangedDPS)
	.setEmoji({ id: '1324558644448067694', name: 'PhysRangedDPS' })
	.setDescription('Select this option if you are a Physical Range DPS.');
const MagicOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.MagicRangedDPS)
	.setValue($Enums.Roles.MagicRangedDPS)
	.setEmoji({ id: '1324558639893315625', name: 'MagicRangedDPS' })
	.setDescription('Select this option if you are a Magical Range DPS.');
const HealerOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.Healer)
	.setValue($Enums.Roles.Healer)
	.setEmoji({ id: '1324558633224114289', name: 'Healer' })
	.setDescription('Select this option if you are a Healer.');
const AllRounderOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.AllRounder)
	.setValue($Enums.Roles.AllRounder)
	.setEmoji({ id: '1324558617193746502', name: 'AllRounder' })
	.setDescription('Select this option if you are an All Rounder.');

export function buildEventComponents(eventId: string, userId: string, shouldDisableEvent = false) {
	const roleSelectMenu = new StringSelectMenuBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleSelectMenu}|${eventId}|${userId}`)
		.setOptions(TankOption, MeleeDpsOption, PhysRangeDpsOption, MagicOption, HealerOption, AllRounderOption);

	const firstRow = new ActionRowBuilder<StringSelectMenuBuilder>();

	if (shouldDisableEvent) {
		roleSelectMenu.setDisabled(true).setPlaceholder('This event is closed');
		firstRow.setComponents(roleSelectMenu);
		return [firstRow];
	}

	const benchButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleBench}|${eventId}|${userId}`)
		.setEmoji({ id: '1324558621530521681', name: 'Bench' })
		.setLabel('Bench')
		.setStyle(ButtonStyle.Secondary);
	const lateButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleLate}|${eventId}|${userId}`)
		.setEmoji({ id: '1324558634243457117', name: 'Late' })
		.setLabel('Late')
		.setStyle(ButtonStyle.Secondary);
	const tentativeButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleTentative}|${eventId}|${userId}`)
		.setEmoji({ id: '1324558656326467616', name: 'Tentative' })
		.setLabel('Tentative')
		.setStyle(ButtonStyle.Secondary);
	const absenceButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RoleAbsence}|${eventId}|${userId}`)
		.setEmoji({ id: '1324558615939649559', name: 'Absence' })
		.setLabel('Absence')
		.setStyle(ButtonStyle.Secondary);
	const removeParticipationButton = new ButtonBuilder()
		.setCustomId(`${CustomIdPrefixes.RemoveParticipation}|${eventId}|${userId}`)
		.setEmoji({ id: '1325255133592031272', name: 'RemoveParticipation' })
		.setLabel('Remove Participation')
		.setStyle(ButtonStyle.Secondary);

	firstRow.setComponents(roleSelectMenu);
	const secondRow = new ActionRowBuilder<ButtonBuilder>().setComponents(
		benchButton,
		lateButton,
		tentativeButton,
		absenceButton,
		removeParticipationButton
	);

	return [firstRow, secondRow];
}
