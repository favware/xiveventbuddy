import { container } from '@sapphire/framework';

export function getFullEventData(eventId: string) {
	return container.prisma.event.findFirstOrThrow({
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
			roleToPing: true,
			updatedAt: true,
			instance: {
				select: {
					eventId: true,
					messageId: true,
					id: true,
					createdAt: true,
					updatedAt: true,
					dateTime: true,
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
