import { BloombotEvents, ErrorIdentifiers } from '#lib/util/constants';
import { BloombotEmojis } from '#lib/util/emojis';
import { OwnerMentions } from '#root/config';
import { $Enums } from '@prisma/client';
import { container, UserError } from '@sapphire/framework';
import { MessageFlags, type ButtonInteraction } from 'discord.js';

export async function handleJobOrRoleButtonClick(interaction: ButtonInteraction, role: $Enums.Roles, job: $Enums.Jobs | null = null) {
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	const [, eventId, userId] = interaction.customId.split('|');

	const eventData = await container.prisma.event.findFirstOrThrow({
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

	if (!eventData?.instance?.id) {
		throw new UserError({
			message: `${BloombotEmojis.RedCross} I was unexpectedly unable to find the event matching the click of that button. Contact ${OwnerMentions} for assistance.`,
			identifier: ErrorIdentifiers.UnableToFindEventForButtonClickError
		});
	}

	const maxSignupOrder = await container.prisma.participant
		.findMany({
			where: {
				eventInstanceId: eventData.instance.eventId
			},
			select: {
				signupOrder: true
			}
		})
		.then((participants) => participants.map((participant) => participant.signupOrder))
		.then((signupOrders) => {
			if (signupOrders.length === 0) return 0;
			return Math.max(...signupOrders);
		});

	await container.prisma.participant.upsert({
		where: {
			eventInstanceId: eventData.instance.id,
			discordId: userId
		},
		create: {
			eventInstanceId: eventData.instance.id,
			discordId: userId,
			job,
			role,
			signupOrder: maxSignupOrder + 1
		},
		update: {
			job,
			role
		}
	});

	if (eventData.instance.messageId) {
		container.client.emit(BloombotEvents.UpdateEmbed, { eventId, interaction });
	}
}
