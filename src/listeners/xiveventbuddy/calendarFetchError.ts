import type { CalendarFetchErrorPayload, EventData, XIVEventBuddyEvents } from '#lib/util/constants';
import { getErrorLine } from '#lib/util/functions/errorHelpers';
import { container, Listener } from '@sapphire/framework';
import { filterNullish, isNullish } from '@sapphire/utilities';
import { EmbedBuilder, Events } from 'discord.js';

export class UserListener extends Listener<typeof XIVEventBuddyEvents.CalendarFetchError> {
	public override async run({ eventId, error }: CalendarFetchErrorPayload) {
		const { logger, prisma } = this.container;

		const eventData = await prisma.event.findFirstOrThrow({
			where: {
				id: eventId
			},
			include: {
				instance: {
					include: {
						participants: true
					}
				}
			}
		});

		// Send a detailed message:
		await sendErrorChannel(eventData as EventData, error);

		// Emit where the error was emitted
		logger.fatal(`[CALENDAR_FETCH_ERROR] aa${error.stack ?? error.message}`);
	}
}

async function sendErrorChannel(eventData: EventData, error: Error) {
	const webhook = container.webhookError;
	if (isNullish(webhook)) return;

	const lines = [
		//
		...getEventLines(eventData),
		getErrorLine(error)
	].filter(filterNullish);

	const embed = new EmbedBuilder() //
		.setTitle('Calendar Fetch Error occurred!')
		.setDescription(lines.join('\n'))
		.setColor('Red')
		.setTimestamp();

	try {
		await webhook.send({ embeds: [embed] });
	} catch (error_) {
		container.client.emit(Events.Error, error_ as Error);
	}
}

function getEventLines(eventData: EventData): string[] {
	return [
		`**Event:** ${eventData.name} (${eventData.id})`,
		`**Description:** ${eventData.description}`,
		`**Date:** ${eventData.instance.dateTime.toISOString()}`
	];
}
