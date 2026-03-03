import { XIVEventBuddyEvents } from '#lib/util/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { isNullishOrEmpty, isNullishOrZero } from '@sapphire/utilities';
import { minutesToMilliseconds } from 'date-fns';
import { Status } from 'discord.js';

@ApplyOptions<ScheduledTask.Options>({
	pattern: '*/1 * * * *',
	customJobOptions: {
		removeOnComplete: true
	}
})
export class SendReminder extends ScheduledTask {
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
			const { reminderChannelId, instance, id: eventId } = event;
			const { reminder, dateTime, id: eventInstanceId, hasSentReminder, isDisabled } = instance ?? {};

			if (!hasSentReminder && !isDisabled && !isNullishOrZero(reminder) && !isNullishOrEmpty(reminderChannelId) && !isNullishOrZero(dateTime)) {
				const reminderTime = new Date(dateTime.getTime() - minutesToMilliseconds(reminder));

				// If it's time to send the reminder
				if (now >= reminderTime && now < dateTime) {
					this.container.client.emit(XIVEventBuddyEvents.SendReminder, {
						eventId: event.id,
						guildId: event.guildId,
						reminderChannelId
					});

					// Ensure no subsequent reminders are sent
					await this.container.prisma.eventInstance.update({
						where: {
							id: eventInstanceId,
							event: {
								id: eventId
							}
						},
						data: {
							hasSentReminder: true
						}
					});
				}
			}
		}
	}
}
