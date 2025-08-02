import { braillePatternBlank, BrandingColors, leftToRightMark, type EventData } from '#lib/util/constants';
import { getEmojiForJob, XIVEventBuddyEmojis } from '#lib/util/emojis';
import { buildAddToCalendarUrl } from '#lib/util/functions/buildAddToCalendarUrl';
import {
	getAbsentParticipants,
	getAllRounderParticipants,
	getBenchedParticipants,
	getHealerParticipants,
	getLateParticipants,
	getMagicRangedDpsParticipants,
	getMeleeDpsParticipants,
	getPhantomJobParticipants,
	getPhysRangedDpsParticipants,
	getPresentParticipants,
	getTankParticipants,
	getTentativeParticipants,
	type FilteredParticipant
} from '#lib/util/functions/participantRoleFilters';
import { $Enums } from '@prisma/client';
import { bold, EmbedBuilder, hyperlink, inlineCode, time, TimestampStyles, underline, userMention } from 'discord.js';

interface BuildEventEmbedParams {
	addToCalendarString: string;
	durationString: string;
	event: EventData;
	shouldDisableEvent?: boolean;
}

export function buildEventEmbed({ event, addToCalendarString, durationString, shouldDisableEvent = false }: BuildEventEmbedParams) {
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
	const phantomJobParticipants = getPhantomJobParticipants(event);
	const allRounderParticipants = getAllRounderParticipants(event);

	builder //
		.setTitle(event.name)
		.setColor(shouldDisableEvent ? BrandingColors.ExpiredEvent : BrandingColors.Primary);

	if (event.description) {
		builder.setDescription(event.description.split(/\\{2,4}n/).join('\n'));
	}

	if (event.bannerImage) {
		builder.setImage('attachment://banner.png');
	}

	builder.addFields(
		{
			inline: true,
			name: leftToRightMark,
			value: [
				`${XIVEventBuddyEmojis.Leader} ${userMention(event.leader)}`,
				`${shouldDisableEvent ? XIVEventBuddyEmojis.DateExpired : XIVEventBuddyEmojis.Date} ${time(eventDateTime, TimestampStyles.ShortDate)}`
			].join('\n')
		},
		{
			inline: true,
			name: leftToRightMark,
			value: [
				`${shouldDisableEvent ? XIVEventBuddyEmojis.SignupsExpired : XIVEventBuddyEmojis.Signups} ${bold(presentParticipants.length.toString())} (+${benchedParticipants.length + lateParticipants.length + tentativeParticipants.length})`,
				`${shouldDisableEvent ? XIVEventBuddyEmojis.TimeExpired : XIVEventBuddyEmojis.Time} ${underline(time(eventDateTime, TimestampStyles.ShortTime))}`
			].join('\n')
		},
		{
			inline: true,
			name: leftToRightMark,
			value: [
				braillePatternBlank,
				`${shouldDisableEvent ? XIVEventBuddyEmojis.CountdownExpired : XIVEventBuddyEmojis.Countdown} ${time(eventDateTime, TimestampStyles.RelativeTime)}`
			].join('\n')
		},
		{
			inline: true,
			name: leftToRightMark,
			value: `${shouldDisableEvent ? XIVEventBuddyEmojis.DurationExpired : XIVEventBuddyEmojis.Duration} ${durationString}`
		},
		{
			inline: true,
			name: leftToRightMark,
			value: `📆 ${hyperlink(addToCalendarString, buildAddToCalendarUrl(event))}`
		},
		{
			inline: true,
			name: braillePatternBlank,
			value: braillePatternBlank
		}
	);

	if (event.variant === $Enums.EventVariant.NORMAL) {
		builder.addFields(
			{
				inline: true,
				name: leftToRightMark,
				value: `${XIVEventBuddyEmojis.Tank} Tanks ${bold(tankParticipants.length.toString())}`
			},
			{
				inline: true,
				name: leftToRightMark,
				value: `${XIVEventBuddyEmojis.DPS} DPS ${bold((meleeDpsParticipants.length + physRangedDpsParticipants.length + magicRangedDpsParticipants.length).toString())}`
			},
			{
				inline: true,
				name: leftToRightMark,
				value: `${XIVEventBuddyEmojis.Healer} Healers ${bold(healerParticipants.length.toString())}`
			}
		);
	}

	if (tankParticipants.length > 0) {
		const tankLines = tankParticipants.map(filteredParticipantsNewLines);
		const tankCount = bold(`(${tankParticipants.length.toString()})`);

		builder.addFields({
			inline: true,
			name: leftToRightMark,
			value: [
				`${XIVEventBuddyEmojis.Tank} ${bold(underline('Tank'))} ${tankCount}`, //
				...tankLines
			].join('\n')
		});
	}

	if (meleeDpsParticipants.length > 0) {
		const meleeDpsLines = meleeDpsParticipants.map(filteredParticipantsNewLines);
		const meleeDpsCount = bold(`(${meleeDpsParticipants.length.toString()})`);

		builder.addFields({
			inline: true,
			name: leftToRightMark,
			value: [
				`${XIVEventBuddyEmojis.MeleeDPS} ${bold(underline('Melee'))} ${meleeDpsCount}`, //
				...meleeDpsLines
			].join('\n')
		});
	}

	if (physRangedDpsParticipants.length > 0) {
		const physRangedDpsLines = physRangedDpsParticipants.map(filteredParticipantsNewLines);
		const physRangedCount = bold(`(${physRangedDpsParticipants.length.toString()})`);

		builder.addFields({
			inline: true,
			name: leftToRightMark,
			value: [
				`${XIVEventBuddyEmojis.PhysRangedDPS} ${bold(underline('Ranged'))} ${physRangedCount}`, //
				...physRangedDpsLines
			].join('\n')
		});
	}

	if (magicRangedDpsParticipants.length > 0) {
		const magicRangedDpsLines = magicRangedDpsParticipants.map(filteredParticipantsNewLines);
		const magicDpsCount = bold(`(${magicRangedDpsParticipants.length.toString()})`);

		builder.addFields({
			inline: true,
			name: leftToRightMark,
			value: [
				`${XIVEventBuddyEmojis.MagicRangedDPS} ${bold(underline('Magical'))} ${magicDpsCount}`, //
				...magicRangedDpsLines
			].join('\n')
		});
	}

	if (healerParticipants.length > 0) {
		const healerLines = healerParticipants.map(filteredParticipantsNewLines);
		const healerCount = bold(`(${healerParticipants.length.toString()})`);

		builder.addFields({
			inline: true,
			name: leftToRightMark,
			value: [
				`${XIVEventBuddyEmojis.Healer} ${bold(underline('Healer'))} ${healerCount}`, //
				...healerLines
			].join('\n')
		});
	}

	if (allRounderParticipants.length > 0) {
		const allRounderLines = allRounderParticipants.map(filteredParticipantsNewLines);
		const allRounderCount = bold(`(${allRounderLines.length.toString()})`);

		builder.addFields({
			inline: true,
			name: leftToRightMark,
			value: [
				`${XIVEventBuddyEmojis.AllRounder} ${bold(underline('Allrounder'))} ${allRounderCount}`, //
				...allRounderLines
			].join('\n')
		});
	}

	if (phantomJobParticipants.length > 0) {
		const phantomJobLines = phantomJobParticipants.map(filteredParticipantsNewLines);
		const phantomJobCount = bold(`(${phantomJobLines.length.toString()})`);

		builder.addFields({
			inline: true,
			name: leftToRightMark,
			value: [
				`${XIVEventBuddyEmojis.PhantomJob} ${bold(underline('Phantom Jobs'))} ${phantomJobCount}`, //
				...phantomJobLines
			].join('\n')
		});
	}

	if (lateParticipants.length > 0) {
		const formattedLateParticipants = lateParticipants.map(formatParticipantsCommaSeparated).join(', ');

		builder.addFields({
			inline: false,
			name: leftToRightMark,
			value: `${XIVEventBuddyEmojis.Late} Late (${lateParticipants.length}): ${formattedLateParticipants}`
		});
	}

	if (benchedParticipants.length > 0) {
		const formattedBenchedParticipants = benchedParticipants.map(formatParticipantsCommaSeparated).join(', ');

		builder.addFields({
			inline: false,
			name: leftToRightMark,
			value: `${XIVEventBuddyEmojis.Bench} Benched (${benchedParticipants.length}): ${formattedBenchedParticipants}`
		});
	}

	if (tentativeParticipants.length > 0) {
		const formattedTentativeParticipants = tentativeParticipants.map(formatParticipantsCommaSeparated).join(', ');

		builder.addFields({
			inline: false,
			name: leftToRightMark,
			value: `${XIVEventBuddyEmojis.Tentative} Tentative (${tentativeParticipants.length}): ${formattedTentativeParticipants}`
		});
	}

	if (absentParticipants.length > 0) {
		const formattedAbsentParticipants = absentParticipants.map(formatParticipantsCommaSeparated).join(', ');

		builder.addFields({
			inline: false,
			name: leftToRightMark,
			value: `${XIVEventBuddyEmojis.Absence} Absence (${absentParticipants.length}): ${formattedAbsentParticipants}`
		});
	}

	return builder;
}

function filteredParticipantsNewLines(participant: FilteredParticipant): string {
	if (participant.job === null) {
		return formatParticipantsCommaSeparated(participant);
	}

	const emoji = getEmojiForJob(participant.job);
	return `${emoji} ${inlineCode(participant.signupOrder.toString())} ${bold(userMention(participant.discordId))}`;
}

function formatParticipantsCommaSeparated(participant: FilteredParticipant): string {
	return `${inlineCode(participant.signupOrder.toString())} ${bold(userMention(participant.discordId))}`;
}
