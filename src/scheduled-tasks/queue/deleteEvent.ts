import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { Status } from 'discord.js';

@ApplyOptions<ScheduledTask.Options>({
	name: 'delete-event',
	customJobOptions: {
		removeOnComplete: true
	}
})
export class DisableOldEvents extends ScheduledTask<'delete-event'> {
	public override async run(payload: { eventId: string }) {
		// If the websocket isn't ready, skip for now
		if (this.container.client.ws.status !== Status.Ready) {
			return;
		}

		await this.container.prisma.event.delete({
			where: {
				id: payload.eventId
			}
		});
	}
}
