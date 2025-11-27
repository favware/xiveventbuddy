import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { Status } from 'discord.js';

@ApplyOptions<ScheduledTask.Options>({
	name: 'delete-event-instance',
	customJobOptions: {
		removeOnComplete: true
	}
})
export class DisableOldEvents extends ScheduledTask<'delete-event-instance'> {
	public override async run(payload: { eventInstanceId: string }) {
		// If the websocket isn't ready, skip for now
		if (this.container.client.ws.status !== Status.Ready) {
			return;
		}

		await this.container.prisma.eventInstance.delete({
			where: {
				id: payload.eventInstanceId
			}
		});
	}
}
