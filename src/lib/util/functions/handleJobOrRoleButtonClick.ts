import { ErrorIdentifiers, UpdateEmbedPayloadOrigin, XIVEventBuddyEvents } from '#lib/util/constants';
import type { $Enums } from '@prisma/client';
import { container, UserError } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { MessageFlags, type ButtonInteraction } from 'discord.js';

export async function handleJobOrRoleButtonClick(interaction: ButtonInteraction<'cached'>, role: $Enums.Roles, job: $Enums.Jobs | null = null) {
	await interaction.deferReply({ flags: MessageFlags.Ephemeral });

	const [, eventId] = interaction.customId.split('|');

	const eventData = await container.prisma.event.findFirst({
		where: {
			id: eventId
		},
		select: {
			channelId: true,
			guildId: true,
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
			message: await resolveKey(interaction, 'interactionHandlers:unexpectedError'),
			identifier: ErrorIdentifiers.UnableToFindEventForButtonClickError
		});
	}

	const result: { max_signup_order: number | null }[] = await container.prisma.$queryRaw /* sql */ `
			SELECT MAX(participants.signup_order) AS max_signup_order
			FROM participants
			WHERE event_instance_id = ${eventData.instance.id}
	`;

	await container.prisma.participant.upsert({
		where: {
			eventInstanceId_discordId: {
				eventInstanceId: eventData.instance.id,
				discordId: interaction.user.id
			}
		},
		create: {
			eventInstanceId: eventData.instance.id,
			discordId: interaction.user.id,
			job,
			role,
			signupOrder: (result.at(0)?.max_signup_order ?? 0) + 1
		},
		update: {
			job,
			role
		}
	});

	if (eventData.instance.messageId) {
		container.client.emit(XIVEventBuddyEvents.UpdateEmbed, {
			interaction,
			eventId,
			guildId: interaction.guildId,
			origin: UpdateEmbedPayloadOrigin.JobOrRoleButtonClick
		});
	}
}
