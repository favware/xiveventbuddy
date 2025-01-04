import { braillePatternBlank, BrandingColors, leftToRightMark, type EventData } from '#lib/util/constants';
import { BloombotEmojis, getEmojiForJob } from '#lib/util/emojis';
import {
	getAbsentParticipants,
	getAllRounderParticipants,
	getBenchedParticipants,
	getHealerParticipants,
	getLateParticipants,
	getMagicRangedDpsParticipants,
	getMeleeDpsParticipants,
	getPhysRangedDpsParticipants,
	getPresentParticipants,
	getTankParticipants,
	getTentativeParticipants,
	type FilteredParticipant
} from '#lib/util/functions/participantRoleFilters';
import { bold, EmbedBuilder, inlineCode, time, TimestampStyles, underline, userMention } from 'discord.js';

export function buildEventEmbed(event: EventData) {
	const builder = new EmbedBuilder();

	const eventDateTime = event.instance.dateTime;
	const benchedParticipants = getBenchedParticipants(event);
	const presentParticipants = getPresentParticipants(event);
	const absentParticipants = getAbsentParticipants(event);
	const lateParticipants = getLateParticipants(event);
	const tentativeParticipants = getTentativeParticipants(event);
	const meleeDpsParticipants = getMeleeDpsParticipants(event);
	const magicRangedDpsParticipants = getMagicRangedDpsParticipants(event);
	const physRangedDpsParticipants = getPhysRangedDpsParticipants(event);
	const tankParticipants = getTankParticipants(event);
	const healerParticipants = getHealerParticipants(event);
	const allRounderParticipants = getAllRounderParticipants(event);

	builder.setTitle(event.name).setColor(BrandingColors.Primary);

	if (event.description) {
		builder.setDescription(event.description.split(/\\{2,4}n/).join('\n'));
	}

	builder.addFields(
		{
			inline: true,
			name: leftToRightMark,
			value: [
				`${BloombotEmojis.Leader} ${userMention(event.leader)}`,
				`${BloombotEmojis.Date} ${time(eventDateTime, TimestampStyles.ShortDate)}`
			].join('\n')
		},
		{
			inline: true,
			name: leftToRightMark,
			value: [
				`${BloombotEmojis.Signups} ${bold(presentParticipants.length.toString())} (+${benchedParticipants.length + absentParticipants.length + lateParticipants.length + tentativeParticipants.length})`,
				`${BloombotEmojis.Time} ${underline(time(eventDateTime, TimestampStyles.ShortTime))}`
			].join('\n')
		},
		{
			inline: true,
			name: leftToRightMark,
			value: [braillePatternBlank, `${BloombotEmojis.Countdown} ${time(eventDateTime, TimestampStyles.RelativeTime)}`].join('\n')
		},
		{
			inline: true,
			name: leftToRightMark,
			value: `${BloombotEmojis.Tank} Tanks ${bold(tankParticipants.length.toString())}`
		},
		{
			inline: true,
			name: leftToRightMark,
			value: `${BloombotEmojis.DPS} DPS ${bold((meleeDpsParticipants.length + physRangedDpsParticipants.length + magicRangedDpsParticipants.length).toString())}`
		},
		{
			inline: true,
			name: leftToRightMark,
			value: `${BloombotEmojis.Healer} Healers ${bold(healerParticipants.length.toString())}`
		}
	);

	if (tankParticipants.length > 0) {
		const tankLines = tankParticipants.map(filteredParticipantsNewLines);

		builder.addFields({
			inline: true,
			name: leftToRightMark,
			value: [
				`${BloombotEmojis.Tank} ${bold(underline(tankParticipants.length.toString()))}`, //
				...tankLines
			].join('\n')
		});
	}

	if (meleeDpsParticipants.length > 0) {
		const meleeDpsLines = meleeDpsParticipants.map(filteredParticipantsNewLines);

		builder.addFields({
			inline: true,
			name: leftToRightMark,
			value: [
				`${BloombotEmojis.MeleeDPS} ${bold(underline(meleeDpsParticipants.length.toString()))}`, //
				...meleeDpsLines
			].join('\n')
		});
	}

	if (physRangedDpsParticipants.length > 0) {
		const physRangedDpsLines = physRangedDpsParticipants.map(filteredParticipantsNewLines);

		builder.addFields({
			inline: true,
			name: leftToRightMark,
			value: [
				`${BloombotEmojis.PhysRangedDPS} ${bold(underline(physRangedDpsParticipants.length.toString()))}`, //
				...physRangedDpsLines
			].join('\n')
		});
	}

	if (magicRangedDpsParticipants.length > 0) {
		const magicRangedDpsLines = magicRangedDpsParticipants.map(filteredParticipantsNewLines);

		builder.addFields({
			inline: true,
			name: leftToRightMark,
			value: [
				`${BloombotEmojis.MagicRangedDPS} ${bold(underline(magicRangedDpsParticipants.length.toString()))}`, //
				...magicRangedDpsLines
			].join('\n')
		});
	}

	if (healerParticipants.length > 0) {
		const healerLines = healerParticipants.map(filteredParticipantsNewLines);

		builder.addFields({
			inline: true,
			name: leftToRightMark,
			value: [
				`${BloombotEmojis.Healer} ${bold(underline(healerParticipants.length.toString()))}`, //
				...healerLines
			].join('\n')
		});
	}

	if (allRounderParticipants.length > 0) {
		const allRounderLines = allRounderParticipants.map(filteredParticipantsNewLines);

		builder.addFields({
			inline: true,
			name: leftToRightMark,
			value: [
				`${BloombotEmojis.AllRounder} ${bold(underline(allRounderParticipants.length.toString()))}`, //
				...allRounderLines
			].join('\n')
		});
	}

	if (lateParticipants.length > 0) {
		const formattedLateParticipants = lateParticipants.map(formatParticipantsCommaSeparated).join(', ');

		builder.addFields({
			inline: false,
			name: leftToRightMark,
			value: `${BloombotEmojis.Late} (${lateParticipants.length}): ${formattedLateParticipants}`
		});
	}

	if (benchedParticipants.length > 0) {
		const formattedBenchedParticipants = benchedParticipants.map(formatParticipantsCommaSeparated).join(', ');

		builder.addFields({
			inline: false,
			name: leftToRightMark,
			value: `${BloombotEmojis.Tentative} (${benchedParticipants.length}): ${formattedBenchedParticipants}`
		});
	}

	if (tentativeParticipants.length > 0) {
		const formattedTentativeParticipants = tentativeParticipants.map(formatParticipantsCommaSeparated).join(', ');

		builder.addFields({
			inline: false,
			name: leftToRightMark,
			value: `${BloombotEmojis.Tentative} (${tentativeParticipants.length}): ${formattedTentativeParticipants}`
		});
	}

	if (absentParticipants.length > 0) {
		const formattedAbsentParticipants = absentParticipants.map(formatParticipantsCommaSeparated).join(', ');

		builder.addFields({
			inline: false,
			name: leftToRightMark,
			value: `${BloombotEmojis.Absence} (${absentParticipants.length}): ${formattedAbsentParticipants}`
		});
	}

	return builder;
}

function filteredParticipantsNewLines(participant: FilteredParticipant): string {
	const emoji = getEmojiForJob(participant.job);
	return `${emoji} ${inlineCode(participant.signupOrder.toString())} ${bold(userMention(participant.discordId))}`;
}

function formatParticipantsCommaSeparated(participant: FilteredParticipant): string {
	const emoji = getEmojiForJob(participant.job);
	return `${emoji} ${inlineCode(participant.signupOrder.toString())} ${bold(userMention(participant.discordId))}`;
}
