import { UpdateEmbedPayloadOrigin, XIVEventBuddyEvents } from '#lib/util/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { subHours } from 'date-fns';
import { Status } from 'discord.js';

@ApplyOptions<ScheduledTask.Options>({
	pattern: '*/10 * * * *',
	customJobOptions: {
		removeOnComplete: true
	}
})
export class DisableOldEvents extends ScheduledTask {
	public override async run() {
		// If the websocket isn't ready, skip for now
		if (this.container.client.ws.status !== Status.Ready) {
			return;
		}

		// Fetch all events
		const events = await this.container.prisma.event.findMany({
			include: {
				instance: true
			}
		});

		const now = new Date();

		for (const event of events) {
			const afterDurationOfEvent = subHours(now, event.duration);

			if (event.instance?.dateTime) {
				const eventInstanceDateTime = event.instance.dateTime;

				if (eventInstanceDateTime <= afterDurationOfEvent) {
					this.container.client.emit(XIVEventBuddyEvents.UpdateEmbed, {
						interaction: null,
						eventId: event.id,
						guildId: event.guildId,
						shouldDisableEvent: true,
						origin: UpdateEmbedPayloadOrigin.DisableOldEventScheduledTask
					});
				}
			}
		}
	}
}
