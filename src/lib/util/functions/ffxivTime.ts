function getEorzeaTime(timeNow: Date) {
	const localEpoch = timeNow.getTime();
	const epoch = localEpoch * (3_600 / 175);
	const minutes = Math.floor((epoch / (1_000 * 60)) % 60);
	const hours = Math.floor((epoch / (1_000 * 60 * 60)) % 24);
	return { hours, minutes };
}

/**
 * Converts a given Earth time to Eorzea time and formats it as a string.
 *
 * @param time - The Earth time to convert.
 * @returns The formatted Eorzea time string.
 */
export function convertToEorzeaTime(time: Date): string {
	const eorzeaTime = getEorzeaTime(time);
	return `${eorzeaTime.hours}:${eorzeaTime.minutes.toString().padStart(2, '0')}`;
}

export function getEUServerTime() {
	const time = new Date();
	const hours = time.getUTCHours().toString().padStart(2, '0');
	const minutes = time.getUTCMinutes().toString().padStart(2, '0');

	return `${hours}:${minutes}`;
}
