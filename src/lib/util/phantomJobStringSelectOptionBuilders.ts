import { formatPhantomJobName } from '#lib/util/functions/formatPhantomJobName';
import { $Enums } from '@prisma/client';
import { StringSelectMenuOptionBuilder } from 'discord.js';

export const PhantomBardOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomBard))
	.setValue($Enums.Jobs.PhantomBard)
	.setEmoji({ id: '1375034095393832991', name: 'PhantomBard' });
export const PhantomBerserkerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomBerserker))
	.setValue($Enums.Jobs.PhantomBerserker)
	.setEmoji({ id: '1375034090343895051', name: 'PhantomBerserker' });
export const PhantomCannoneerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomCannoneer))
	.setValue($Enums.Jobs.PhantomCannoneer)
	.setEmoji({ id: '1375034085679829043', name: 'PhantomCannoneer' });
export const PhantomChemistOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomChemist))
	.setValue($Enums.Jobs.PhantomChemist)
	.setEmoji({ id: '1375034096794996737', name: 'PhantomChemist' });
export const PhantomFreelancerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomFreelancer))
	.setValue($Enums.Jobs.PhantomFreelancer)
	.setEmoji({ id: '1375034084694294549', name: 'PhantomFreelancer' });
export const PhantomGeomancerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomGeomancer))
	.setValue($Enums.Jobs.PhantomGeomancer)
	.setEmoji({ id: '1375034083427483710', name: 'PhantomGeomancer' });
export const PhantomKnightOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomKnight))
	.setValue($Enums.Jobs.PhantomKnight)
	.setEmoji({ id: '1375034086464290920', name: 'PhantomKnight' });
export const PhantomMonkOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomMonk))
	.setValue($Enums.Jobs.PhantomMonk)
	.setEmoji({ id: '1375034092160286801', name: 'PhantomMonk' });
export const PhantomOracleOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomOracle))
	.setValue($Enums.Jobs.PhantomOracle)
	.setEmoji({ id: '1375034087785500683', name: 'PhantomOracle' });
export const PhantomRangerOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomRanger))
	.setValue($Enums.Jobs.PhantomRanger)
	.setEmoji({ id: '1375034089186525247', name: 'PhantomRanger' });
export const PhantomSamuraiOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomSamurai))
	.setValue($Enums.Jobs.PhantomSamurai)
	.setEmoji({ id: '1375034082249019492', name: 'PhantomSamurai' });
export const PhantomThiefOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomThief))
	.setValue($Enums.Jobs.PhantomThief)
	.setEmoji({ id: '1375034080416104519', name: 'PhantomThief' });
export const PhantomTimeMageOption = new StringSelectMenuOptionBuilder()
	.setLabel(formatPhantomJobName($Enums.Jobs.PhantomTimeMage))
	.setValue($Enums.Jobs.PhantomTimeMage)
	.setEmoji({ id: '1375034093753864262', name: 'PhantomTimeMage' });
