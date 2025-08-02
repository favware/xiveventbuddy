import type { EventData } from '#lib/util/constants';
import { addHours } from 'date-fns';
import { URL } from 'node:url';

const baseURL = 'https://cal-links.naimea.dev/';
export function buildAddToCalendarUrl(event: EventData): string {
	const url = new URL(baseURL);
	url.searchParams.set('start', event.instance.dateTime.toISOString());
	url.searchParams.set('end', addHours(event.instance.dateTime, event.duration).toISOString());
	url.searchParams.set('allDay', 'false');
	url.searchParams.set('location', '');
	url.searchParams.set('summary', event.name);
	url.searchParams.set('description', event.description ?? '');

	console.log(url.toString());

	return url.toString();
}
