import type { EventData } from '#lib/util/constants';
import { BrandingColors, CustomIdPrefixes } from '#lib/util/constants';
import { getEmojiForJob, XIVEventBuddyEmojis } from '#lib/util/emojis';
import { buildAddToCalendarUrl } from '#lib/util/functions/buildAddToCalendarUrl';
import { getPresenceStateButtons, getRemoveParticipationButton } from '#lib/util/functions/getPresenceStateButtons';
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
import {
	PhantomBardOption,
	PhantomBerserkerOption,
	PhantomCannoneerOption,
	PhantomChemistOption,
	PhantomFreelancerOption,
	PhantomGeomancerOption,
	PhantomKnightOption,
	PhantomMonkOption,
	PhantomOracleOption,
	PhantomRangerOption,
	PhantomSamuraiOption,
	PhantomThiefOption,
	PhantomTimeMageOption
} from '#lib/util/phantomJobStringSelectOptionBuilders';
import {
	AllRounderOption,
	HealerOption,
	MagicOption,
	MeleeDpsOption,
	PhysRangeDpsOption,
	TankOption
} from '#lib/util/roleStringSelectOptionBuilders';
import { $Enums } from '@prisma/client';
import { resolveKey } from '@sapphire/plugin-i18next';
import { isNullish, isNullishOrEmpty } from '@sapphire/utilities';
import {
	BaseInteraction,
	bold,
	ButtonBuilder,
	ButtonStyle,
	ContainerBuilder,
	inlineCode,
	roleMention,
	StringSelectMenuBuilder,
	time,
	TimestampStyles,
	underline,
	userMention,
	type Locale
} from 'discord.js';

interface BuildEventComponentsParams {
	addToCalendarString: string;
	durationString: string;
	event: EventData;
	interactionOrLocale: BaseInteraction | Locale;
	shouldDisableEvent?: boolean;
}

export async function buildEventComponents({
	interactionOrLocale,
	event,
	addToCalendarString,
	durationString,
	shouldDisableEvent = false
}: BuildEventComponentsParams) {
	const interactionAsInteraction = interactionOrLocale instanceof BaseInteraction ? interactionOrLocale : null;
	const lng = isNullish(interactionAsInteraction) ? (interactionOrLocale as Locale) : undefined;

	const container = new ContainerBuilder();

	const { description, bannerImage, instance } = event;
	const { dateTime: eventDateTime } = instance;
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

	if (!isNullishOrEmpty(event.rolesToPing)) {
		const content = await resolveKey(interactionAsInteraction!, 'globals:andListValue', {
			value: event.rolesToPing.map(roleMention),
			lng
		});
		container.addTextDisplayComponents((textDisplay) => textDisplay.setContent(content));
	}

	container
		.setAccentColor(shouldDisableEvent ? BrandingColors.ExpiredEvent : BrandingColors.Primary)
		.addTextDisplayComponents((textDisplay) => textDisplay.setContent(event.name));

	if (description) {
		container.addTextDisplayComponents((textDisplay) => textDisplay.setContent(description.split(/\\{2,4}n/).join('\n')));
	}

	container
		.addSeparatorComponents((separator) => separator)
		.addTextDisplayComponents(
			(textDisplay) =>
				textDisplay.setContent(
					[
						`${XIVEventBuddyEmojis.Leader} ${userMention(event.leader)}`,
						`${shouldDisableEvent ? XIVEventBuddyEmojis.SignupsExpired : XIVEventBuddyEmojis.Signups} ${bold(presentParticipants.length.toString())} (+${benchedParticipants.length + lateParticipants.length + tentativeParticipants.length})`,
						`${shouldDisableEvent ? XIVEventBuddyEmojis.DurationExpired : XIVEventBuddyEmojis.Duration} ${durationString}`
					].join('\t')
				),
			(textDisplay) =>
				textDisplay.setContent(
					[
						`${shouldDisableEvent ? XIVEventBuddyEmojis.DateExpired : XIVEventBuddyEmojis.Date} ${time(eventDateTime, TimestampStyles.ShortDate)}`,
						`${shouldDisableEvent ? XIVEventBuddyEmojis.TimeExpired : XIVEventBuddyEmojis.Time} ${underline(time(eventDateTime, TimestampStyles.ShortTime))}`,
						`${shouldDisableEvent ? XIVEventBuddyEmojis.CountdownExpired : XIVEventBuddyEmojis.Countdown} ${time(eventDateTime, TimestampStyles.RelativeTime)}`
					].join('\t')
				)
		)
		.addActionRowComponents((actionRow) =>
			actionRow.setComponents(
				new ButtonBuilder()
					.setURL(buildAddToCalendarUrl(event))
					.setLabel(addToCalendarString)
					.setStyle(ButtonStyle.Link)
					.setEmoji({ name: '📅' })
			)
		)
		.addSeparatorComponents((separator) => separator);

	if (event.variant === $Enums.EventVariant.NORMAL) {
		container.addTextDisplayComponents((textDisplay) =>
			textDisplay.setContent(
				[
					`${XIVEventBuddyEmojis.Tank} Tanks ${bold(tankParticipants.length.toString())}`,
					`${XIVEventBuddyEmojis.DPS} DPS ${bold((meleeDpsParticipants.length + physRangedDpsParticipants.length + magicRangedDpsParticipants.length).toString())}`,
					`${XIVEventBuddyEmojis.Healer} Healers ${bold(healerParticipants.length.toString())}`
				].join('\t')
			)
		);
	}

	if (tankParticipants.length > 0) {
		const tankLines = await resolveKey(interactionAsInteraction!, 'globals:andListValue', {
			value: tankParticipants.map(filteredParticipantsNewLines),
			lng
		});
		const tankCount = bold(`(${tankParticipants.length.toString()})`);

		container.addTextDisplayComponents(
			(textDisplay) => textDisplay.setContent(`${XIVEventBuddyEmojis.Tank} ${bold(underline('Tank'))} ${tankCount}`),
			(textDisplay) => textDisplay.setContent(tankLines)
		);
	}

	if (meleeDpsParticipants.length > 0) {
		const meleeDpsLines = await resolveKey(interactionAsInteraction!, 'globals:andListValue', {
			value: meleeDpsParticipants.map(filteredParticipantsNewLines),
			lng
		});
		const meleeDpsCount = bold(`(${meleeDpsParticipants.length.toString()})`);

		container.addTextDisplayComponents(
			(textDisplay) => textDisplay.setContent(`${XIVEventBuddyEmojis.MeleeDPS} ${bold(underline('Melee'))} ${meleeDpsCount}`),
			(textDisplay) => textDisplay.setContent(meleeDpsLines)
		);
	}

	if (physRangedDpsParticipants.length > 0) {
		const physRangedDpsLines = await resolveKey(interactionAsInteraction!, 'globals:andListValue', {
			value: physRangedDpsParticipants.map(filteredParticipantsNewLines),
			lng
		});
		const physRangedCount = bold(`(${physRangedDpsParticipants.length.toString()})`);

		container.addTextDisplayComponents(
			(textDisplay) => textDisplay.setContent(`${XIVEventBuddyEmojis.PhysRangedDPS} ${bold(underline('Ranged'))} ${physRangedCount}`),
			(textDisplay) => textDisplay.setContent(physRangedDpsLines)
		);
	}

	if (magicRangedDpsParticipants.length > 0) {
		const magicRangedDpsLines = await resolveKey(interactionAsInteraction!, 'globals:andListValue', {
			value: magicRangedDpsParticipants.map(filteredParticipantsNewLines),
			lng
		});
		const magicDpsCount = bold(`(${magicRangedDpsParticipants.length.toString()})`);

		container.addTextDisplayComponents(
			(textDisplay) => textDisplay.setContent(`${XIVEventBuddyEmojis.MagicRangedDPS} ${bold(underline('Magical'))} ${magicDpsCount}`),
			(textDisplay) => textDisplay.setContent(magicRangedDpsLines)
		);
	}

	if (healerParticipants.length > 0) {
		const healerLines = await resolveKey(interactionAsInteraction!, 'globals:andListValue', {
			value: healerParticipants.map(filteredParticipantsNewLines),
			lng
		});
		const healerCount = bold(`(${healerParticipants.length.toString()})`);

		container.addTextDisplayComponents(
			(textDisplay) => textDisplay.setContent(`${XIVEventBuddyEmojis.Healer} ${bold(underline('Healer'))} ${healerCount}`),
			(textDisplay) => textDisplay.setContent(healerLines)
		);
	}

	if (allRounderParticipants.length > 0) {
		const allRounderLines = await resolveKey(interactionAsInteraction!, 'globals:andListValue', {
			value: allRounderParticipants.map(filteredParticipantsNewLines),
			lng
		});
		const allRounderCount = bold(`(${allRounderLines.length.toString()})`);

		container.addTextDisplayComponents(
			(textDisplay) => textDisplay.setContent(`${XIVEventBuddyEmojis.AllRounder} ${bold(underline('Allrounder'))} ${allRounderCount}`),
			(textDisplay) => textDisplay.setContent(allRounderLines)
		);
	}

	if (phantomJobParticipants.length > 0) {
		const phantomJobLines = await resolveKey(interactionAsInteraction!, 'globals:andListValue', {
			value: phantomJobParticipants.map(filteredParticipantsNewLines),
			lng
		});
		const phantomJobCount = bold(`(${phantomJobLines.length.toString()})`);

		container.addTextDisplayComponents(
			(textDisplay) => textDisplay.setContent(`${XIVEventBuddyEmojis.PhantomJob} ${bold(underline('Phantom Jobs'))} ${phantomJobCount}`),
			(textDisplay) => textDisplay.setContent(phantomJobLines)
		);
	}

	container.addSeparatorComponents((separator) => separator);

	let hasAddedStatusEntry = false;
	if (lateParticipants.length > 0) {
		const formattedLateParticipants = lateParticipants.map(formatParticipantsCommaSeparated).join(', ');

		container.addTextDisplayComponents((textDisplay) =>
			textDisplay.setContent(`${XIVEventBuddyEmojis.Late} Late (${lateParticipants.length}): ${formattedLateParticipants}`)
		);
		hasAddedStatusEntry = true;
	}

	if (benchedParticipants.length > 0) {
		const formattedBenchedParticipants = benchedParticipants.map(formatParticipantsCommaSeparated).join(', ');

		container.addTextDisplayComponents((textDisplay) =>
			textDisplay.setContent(`${XIVEventBuddyEmojis.Bench} Benched (${benchedParticipants.length}): ${formattedBenchedParticipants}`)
		);
		hasAddedStatusEntry = true;
	}

	if (tentativeParticipants.length > 0) {
		const formattedTentativeParticipants = tentativeParticipants.map(formatParticipantsCommaSeparated).join(', ');

		container.addTextDisplayComponents((textDisplay) =>
			textDisplay.setContent(`${XIVEventBuddyEmojis.Tentative} Tentative (${tentativeParticipants.length}): ${formattedTentativeParticipants}`)
		);
		hasAddedStatusEntry = true;
	}

	if (absentParticipants.length > 0) {
		const formattedAbsentParticipants = absentParticipants.map(formatParticipantsCommaSeparated).join(', ');

		container.addTextDisplayComponents((textDisplay) =>
			textDisplay.setContent(`${XIVEventBuddyEmojis.Absence} Absence (${absentParticipants.length}): ${formattedAbsentParticipants}`)
		);
		hasAddedStatusEntry = true;
	}

	if (hasAddedStatusEntry) {
		container.addSeparatorComponents((separator) => separator);
	}

	const roleSelectMenu =
		event.variant === $Enums.EventVariant.NORMAL
			? new StringSelectMenuBuilder()
					.setCustomId(`${CustomIdPrefixes.RoleSelectMenu}|${event.id}`)
					.setOptions(
						TankOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectTank', { lng })),
						MeleeDpsOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectMeleeDps', { lng })),
						PhysRangeDpsOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectPhysRangedDps', { lng })),
						MagicOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectMagicRangedDps', { lng })),
						HealerOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectHealer', { lng })),
						AllRounderOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectAllRounder', { lng }))
					)
			: new StringSelectMenuBuilder()
					.setCustomId(`${CustomIdPrefixes.PhantomJobSelectMenu}|${event.id}`)
					.setOptions(
						PhantomBardOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectPhantomBard', { lng })),
						PhantomBerserkerOption.setDescription(
							await resolveKey(interactionAsInteraction!, 'components:selectPhantomBerserker', { lng })
						),
						PhantomCannoneerOption.setDescription(
							await resolveKey(interactionAsInteraction!, 'components:selectPhantomCannoneer', { lng })
						),
						PhantomChemistOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectPhantomChemist', { lng })),
						PhantomFreelancerOption.setDescription(
							await resolveKey(interactionAsInteraction!, 'components:selectPhantomFreelancer', { lng })
						),
						PhantomGeomancerOption.setDescription(
							await resolveKey(interactionAsInteraction!, 'components:selectPhantomGeomancer', { lng })
						),
						PhantomKnightOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectPhantomKnight', { lng })),
						PhantomMonkOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectPhantomMonk', { lng })),
						PhantomOracleOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectPhantomOracle', { lng })),
						PhantomRangerOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectPhantomRanger', { lng })),
						PhantomSamuraiOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectPhantomSamurai', { lng })),
						PhantomThiefOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectPhantomThief', { lng })),
						PhantomTimeMageOption.setDescription(await resolveKey(interactionAsInteraction!, 'components:selectPhantomTimeMage', { lng }))
					);

	if (shouldDisableEvent) {
		roleSelectMenu.setDisabled(true).setPlaceholder(await resolveKey(interactionAsInteraction!, 'components:eventClosed', { lng }));

		container.addActionRowComponents((actionRow) => actionRow.setComponents(roleSelectMenu));
	} else {
		const presenceStateButtons = await getPresenceStateButtons(interactionOrLocale, event.id);
		container
			.addActionRowComponents((actionRow) => actionRow.setComponents(roleSelectMenu))
			.addActionRowComponents((actionRow) => actionRow.setComponents(presenceStateButtons));
	}

	if (bannerImage) {
		container.addMediaGalleryComponents((builder) =>
			builder.addItems((item) =>
				item //
					.setDescription('Event Banner')
					.setURL('attachment://banner.png')
			)
		);
	}

	if (!shouldDisableEvent) {
		const removeParticipationButton = await getRemoveParticipationButton(interactionOrLocale, event.id);
		container.addActionRowComponents((actionRow) => actionRow.setComponents(removeParticipationButton));
	}

	return container;
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
