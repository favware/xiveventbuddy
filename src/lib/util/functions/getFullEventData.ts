import { container } from '@sapphire/framework';

export function getFullEventData(eventId: string) {
	return container.prisma.event.findFirst({
		where: {
			id: eventId
		},
		select: {
			channelId: true,
			createdAt: true,
			description: true,
			id: true,
			interval: true,
			leader: true,
			name: true,
			rolesToPing: true,
			updatedAt: true,
			instance: {
				select: {
					eventId: true,
					messageId: true,
					id: true,
					createdAt: true,
					updatedAt: true,
					dateTime: true,
					discordEventId: true,
					participants: {
						select: {
							createdAt: true,
							id: true,
							updatedAt: true,
							discordId: true,
							job: true,
							role: true,
							signupOrder: true
						}
					}
				}
			}
		}
	});
}
