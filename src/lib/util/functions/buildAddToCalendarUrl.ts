import { XIVEventBuddyEvents, type EventData } from '#lib/util/constants';
import { fetch, FetchMediaContentTypes, FetchMethods, FetchResultTypes } from '@sapphire/fetch';
import { container } from '@sapphire/framework';
import { envParseString } from '@skyra/env-utilities';
import { addHours } from 'date-fns';
import { URL } from 'node:url';

const inputBaseUrl = 'https://cal-links.naimea.dev/';
const naimeaDevUrl = 'https://s.naimea.dev';

export async function buildAddToCalendarUrl(event: EventData): Promise<string | undefined> {
	try {
		const url = new URL(inputBaseUrl);
		url.searchParams.set('start', event.instance.dateTime.toISOString());
		url.searchParams.set('end', addHours(event.instance.dateTime, event.duration).toISOString());
		url.searchParams.set('allDay', 'false');
		url.searchParams.set('location', '');
		url.searchParams.set('summary', event.name);
		url.searchParams.set('description', (event.description ?? '').split('\n').join(' '));

		const result = await fetch(
			`${naimeaDevUrl}/create`,
			{
				method: FetchMethods.Post,
				headers: {
					'Content-Type': FetchMediaContentTypes.JSON,
					'X-API-KEY': envParseString('CAL_LINKS_API_KEY')
				},
				body: {
					url: url.toString()
				}
			},
			FetchResultTypes.Text
		);

		return `${naimeaDevUrl}/${result}`;
	} catch (error) {
		container.client.emit(XIVEventBuddyEvents.CalendarFetchError, {
			eventId: event.id,
			error: error instanceof Error ? error : new Error('Unknown error')
		});
		// On error return undefined, which will cause the add to calendar button to not be rendered.
		return undefined;
	}
}
