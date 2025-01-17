import { BloombotEvents } from '#lib/util/constants';
import { $Enums } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { addDays, addHours, addMonths, differenceInHours, getDay, isBefore, isFirstDayOfMonth, lastDayOfMonth, subDays } from 'date-fns';
import { Status } from 'discord.js';

@ApplyOptions<ScheduledTask.Options>({
	pattern: '*/10 * * * *',
	customJobOptions: {
		removeOnComplete: true
	}
})
export class RescheduleEventTask extends ScheduledTask {
	public override async run() {
		// If the websocket isn't ready, skip for now
		if (this.container.client.ws.status !== Status.Ready) {
			return;
		}

		console.group();

		// Fetch all events where interval is not null
		const events = await this.container.prisma.event.findMany({
			where: {
				interval: {
					not: null
				}
			},
			include: {
				instance: true
			}
		});

		this.container.client.logger.debug(
			`Found ${events.length} events to potentially reschedule with names: `,
			events.map((event) => event.name)
		);

		const now = new Date();
		const sevenDays = 7 * 24;

		this.container.client.logger.debug(`Current time: ${now.toISOString()}`);
		this.container.client.logger.debug(`Seven days in hours: ${sevenDays}`);

		for (const event of events) {
			this.container.client.logger.debug(`Processing event: ${event.name}`);
			if (!event.instance) continue;
			this.container.client.logger.debug(`Event instance found for event: ${event.name}`);

			const { duration } = event;
			const { dateTime, isActive } = event.instance;
			let shouldReschedule = false;
			let newDateTime = dateTime;
			this.container.client.logger.debug(`Event instance dateTime: ${dateTime.toISOString()}`);
			this.container.client.logger.debug(`Event instance isActive: ${isActive}`);
			this.container.client.logger.debug(`Event instance duration: ${duration}`);
			this.container.client.logger.debug(`Event instance interval: ${event.interval}`);

			switch (event.interval) {
				case $Enums.EventInterval.WEEKLY:
					shouldReschedule = differenceInHours(addDays(dateTime, 7), now) <= sevenDays && addHours(dateTime, duration) < now && !isActive;
					newDateTime = addDays(dateTime, 7);
					this.container.client.logger.debug('differenceInHours: ', differenceInHours(addDays(dateTime, 7), now));
					this.container.client.logger.debug('differenceInHours boolean: ', differenceInHours(addDays(dateTime, 7), now) <= sevenDays);
					this.container.client.logger.debug('addHours: ', addHours(dateTime, duration));
					this.container.client.logger.debug('addHours boolean: ', addHours(dateTime, duration) < now);
					this.container.client.logger.debug('!isActive: ', !isActive);
					this.container.client.logger.debug(`Should reschedule: ${shouldReschedule}`);
					this.container.client.logger.debug(`New date time: ${newDateTime.toISOString()}`);
					break;
				case $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK:
					shouldReschedule = differenceInHours(addDays(dateTime, 14), now) <= sevenDays && addHours(dateTime, duration) < now && !isActive;
					newDateTime = addDays(dateTime, 14);
					break;
				case $Enums.EventInterval.MONTHLY:
					if (isFirstDayOfMonth(now)) {
						newDateTime = addMonths(dateTime, 1);
						shouldReschedule = !isActive;
					}

					break;
				case $Enums.EventInterval.ONE_BEFORE_LAST_FRIDAY_OF_THE_MONTH:
					if (isFirstDayOfMonth(now)) {
						newDateTime = this.getOneBeforeLastFriday(addMonths(dateTime, 1));
						shouldReschedule = !isActive;
					}

					break;
			}

			if (shouldReschedule && isBefore(dateTime, now)) {
				// Delete the old event instance
				await this.container.prisma.eventInstance.delete({
					where: { id: event.instance.id }
				});

				// Create a new event instance with the updated dateTime
				await this.container.prisma.eventInstance.create({
					data: {
						eventId: event.id,
						dateTime: newDateTime
					}
				});

				this.container.client.emit(BloombotEvents.PostEmbed, { eventId: event.id, guildId: event.guildId });
				this.container.client.emit(BloombotEvents.CreateServerEvent, { eventId: event.id, guildId: event.guildId, isReschedule: true });
			}

			console.groupEnd();
		}
	}

	private getOneBeforeLastFriday(date: Date) {
		const lastDay = lastDayOfMonth(date);
		const lastFriday = subDays(lastDay, (getDay(lastDay) + 2) % 7);
		const oneBeforeLastFriday = subDays(lastFriday, 7);
		return new Date(Date.UTC(oneBeforeLastFriday.getFullYear(), oneBeforeLastFriday.getMonth(), oneBeforeLastFriday.getDate()));
	}
}
