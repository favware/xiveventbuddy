import { $Enums } from '@prisma/client';
import { StringSelectMenuOptionBuilder } from 'discord.js';

export const TankOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.Tank)
	.setValue($Enums.Roles.Tank)
	.setEmoji({ id: '1324558655202398279', name: 'Tank' });
export const MeleeDpsOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.MeleeDPS)
	.setValue($Enums.Roles.MeleeDPS)
	.setEmoji({ id: '1324558637288394869', name: 'MeleeDPS' });
export const PhysRangeDpsOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.PhysRangedDPS)
	.setValue($Enums.Roles.PhysRangedDPS)
	.setEmoji({ id: '1324558644448067694', name: 'PhysRangedDPS' });
export const MagicOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.MagicRangedDPS)
	.setValue($Enums.Roles.MagicRangedDPS)
	.setEmoji({ id: '1324558639893315625', name: 'MagicRangedDPS' });
export const HealerOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.Healer)
	.setValue($Enums.Roles.Healer)
	.setEmoji({ id: '1324558633224114289', name: 'Healer' });
export const AllRounderOption = new StringSelectMenuOptionBuilder()
	.setLabel($Enums.Roles.AllRounder)
	.setValue($Enums.Roles.AllRounder)
	.setEmoji({ id: '1324558617193746502', name: 'AllRounder' });
