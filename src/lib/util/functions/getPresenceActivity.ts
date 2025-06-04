import { getEUServerTime } from '#lib/util/functions/ffxivTime';
import { type ActivitiesOptions, ActivityType, PresenceUpdateStatus } from 'discord.js';

const baseActivityName = 'Critically acclaimed MMORPG Final Fantasy XIV';

export function getPresenceActivity(): ActivitiesOptions {
	const serverTime = getEUServerTime();

	return {
		name: `ST: ${serverTime} | ${baseActivityName}`,
		type: ActivityType.Playing,
		state: PresenceUpdateStatus.Online
	};
}
