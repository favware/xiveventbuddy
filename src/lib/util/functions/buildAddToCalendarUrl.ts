import type { EventData } from '#lib/util/constants';
import { splitText } from '@sapphire/utilities';
import { addHours } from 'date-fns';
import { URL } from 'node:url';

const baseURL = 'https://cal-links.naimea.dev/';
export function buildAddToCalendarUrl(event: EventData): string {
	const url = new URL(baseURL);
	url.searchParams.set('start', event.instance.dateTime.toISOString());
	url.searchParams.set('end', addHours(event.instance.dateTime, event.duration).toISOString());
	url.searchParams.set('allDay', 'false');
	url.searchParams.set('location', '');
	url.searchParams.set('summary', splitText(event.name, 75));
	url.searchParams.set('description', splitText(event.description ?? '', 275));

	return url.toString();
}
