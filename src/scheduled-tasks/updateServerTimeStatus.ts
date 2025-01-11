import { getPresenceActivity } from '#lib/util/functions/getPresenceActivity';
import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { Status } from 'discord.js';

@ApplyOptions<ScheduledTask.Options>({
	pattern: '* * * * *',
	customJobOptions: {
		removeOnComplete: true
	}
})
export class UpdateServerTimeInStatus extends ScheduledTask {
	public override run() {
		// If the websocket isn't ready, skip for now
		if (this.container.client.ws.status !== Status.Ready || !this.container.client.user) {
			return;
		}

		return this.container.client.user.setActivity(getPresenceActivity());
	}
}
