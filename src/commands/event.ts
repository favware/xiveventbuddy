import { XIVEventBuddyCommand } from '#lib/extensions/XIVEventBuddyComand';
import { ErrorIdentifiers, UpdateEmbedPayloadOrigin, XIVEventBuddyEvents, type EventData } from '#lib/util/constants';
import { XIVEventBuddyEmojis } from '#lib/util/emojis';
import { buildEventAttachment } from '#lib/util/functions/buildEventAttachment';
import { buildEventComponents } from '#lib/util/functions/buildEventComponents';
import { buildEventEmbed } from '#lib/util/functions/buildEventEmbed';
import { buildPhantomJobComponent } from '#lib/util/functions/buildPhantomJobComponent';
import { resolveOnErrorCodes } from '#lib/util/functions/resolveOnErrorCodes';
import { Owners } from '#root/config';
import { $Enums } from '@prisma/client';
import { fetch, FetchResultTypes } from '@sapphire/fetch';
import { Result, UserError, type ApplicationCommandRegistry, type Awaitable, type ChatInputCommand } from '@sapphire/framework';
import { applyLocalizedBuilder, createLocalizedChoice, resolveKey, type $Dictionary } from '@sapphire/plugin-i18next';
import { filterNullish, isNullishOrEmpty, isNullishOrZero } from '@sapphire/utilities';
import { format } from 'date-fns';
import {
	ApplicationIntegrationType,
	heading,
	inlineCode,
	MessageFlags,
	PermissionFlagsBits,
	RESTJSONErrorCodes,
	roleMention,
	time,
	TimestampStyles,
	unorderedList,
	userMention
} from 'discord.js';

export class SlashCommand extends XIVEventBuddyCommand {
	private readonly timeRegex = /^(?:0\d|1\d|2[0-4]):[0-5]\d$/;

	public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
		registry.registerChatInputCommand((command) =>
			applyLocalizedBuilder(command, 'commands/event:root') //
				.setIntegrationTypes(ApplicationIntegrationType.GuildInstall)
				.addSubcommand((builder) =>
					applyLocalizedBuilder(builder, 'commands/event:create')
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:event') //
								.setRequired(true)
						)
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:date') //
								.setRequired(true)
						)
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:time') //
								.setRequired(true)
						)
						.addIntegerOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:duration') //
								.setChoices(
									createLocalizedChoice('commands/event:duration1Hour', { value: 1 }),
									createLocalizedChoice('commands/event:duration2Hours', { value: 2 }),
									createLocalizedChoice('commands/event:duration3Hours', { value: 3 }),
									createLocalizedChoice('commands/event:duration4Hours', { value: 4 })
								)
								.setRequired(true)
						)
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:description') //
								.setRequired(false)
						)
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:interval') //
								.setRequired(false)
								.setChoices(
									createLocalizedChoice('commands/event:intervalWeekly', { value: $Enums.EventInterval.WEEKLY }),
									createLocalizedChoice('commands/event:intervalOnceEveryOtherWeek', {
										value: $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK
									}),
									createLocalizedChoice('commands/event:intervalMonthly', { value: $Enums.EventInterval.MONTHLY }),
									createLocalizedChoice('commands/event:intervalOneBeforeLastFridayOfTheMonth', {
										value: $Enums.EventInterval.ONE_BEFORE_LAST_FRIDAY_OF_THE_MONTH
									})
								)
						)
						.addRoleOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:roleToPing') //
								.setRequired(false)
						)
						.addRoleOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:secondRoleToPing') //
								.setRequired(false)
						)
						.addRoleOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:thirdRoleToPing') //
								.setRequired(false)
						)
						.addChannelOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:channel') //
								.setRequired(false)
						)
						.addUserOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:leader') //
								.setRequired(false)
						)
						.addAttachmentOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:banner') //
								.setRequired(false)
						)
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:variant') //
								.setRequired(false)
								.setChoices(
									createLocalizedChoice('commands/event:variantNormal', { value: $Enums.EventVariant.NORMAL }),
									createLocalizedChoice('commands/event:variantOccultCrescent', { value: $Enums.EventVariant.OCCULT_CRESCENT })
								)
						)
				)
				.addSubcommand(
					(builder) => applyLocalizedBuilder(builder, 'commands/event:list') //
				)
				.addSubcommand((builder) =>
					applyLocalizedBuilder(builder, 'commands/event:edit') //
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:eventId') //
								.setAutocomplete(true)
								.setRequired(true)
						)
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:event') //
								.setRequired(false)
						)
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:date') //
								.setRequired(false)
						)
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:time') //
								.setRequired(false)
						)
						.addIntegerOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:duration') //
								.setChoices(
									createLocalizedChoice('commands/event:duration1Hour', { value: 1 }),
									createLocalizedChoice('commands/event:duration2Hours', { value: 2 }),
									createLocalizedChoice('commands/event:duration3Hours', { value: 3 }),
									createLocalizedChoice('commands/event:duration4Hours', { value: 4 })
								)
								.setRequired(false)
						)
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:description') //
								.setRequired(false)
						)
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:interval') //
								.setRequired(false)
								.setChoices(
									createLocalizedChoice('commands/event:intervalWeekly', { value: $Enums.EventInterval.WEEKLY }),
									createLocalizedChoice('commands/event:intervalOnceEveryOtherWeek', {
										value: $Enums.EventInterval.ONCE_EVERY_OTHER_WEEK
									}),
									createLocalizedChoice('commands/event:intervalMonthly', { value: $Enums.EventInterval.MONTHLY }),
									createLocalizedChoice('commands/event:intervalOneBeforeLastFridayOfTheMonth', {
										value: $Enums.EventInterval.ONE_BEFORE_LAST_FRIDAY_OF_THE_MONTH
									})
								)
						)
						.addRoleOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:roleToPing') //
								.setRequired(false)
						)
						.addRoleOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:secondRoleToPing') //
								.setRequired(false)
						)
						.addRoleOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:thirdRoleToPing') //
								.setRequired(false)
						)
						.addChannelOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:channel') //
								.setRequired(false)
						)
						.addUserOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:leader') //
								.setRequired(false)
						)
						.addAttachmentOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:banner') //
								.setRequired(false)
						)
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:variant') //
								.setRequired(false)
								.setChoices(
									createLocalizedChoice('commands/event:variantNormal', { value: $Enums.EventVariant.NORMAL }),
									createLocalizedChoice('commands/event:variantOccultCrescent', { value: $Enums.EventVariant.OCCULT_CRESCENT })
								)
						)
				)
				.addSubcommand((builder) =>
					applyLocalizedBuilder(builder, 'commands/event:delete') //
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:eventId') //
								.setAutocomplete(true)
								.setRequired(true)
						)
				)
				.addSubcommand((builder) =>
					applyLocalizedBuilder(builder, 'commands/event:removeParticipant') //
						.addStringOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:eventId') //
								.setAutocomplete(true)
								.setRequired(true)
						)
						.addUserOption((builder) =>
							applyLocalizedBuilder(builder, 'commands/event:participant') //
								.setRequired(true)
						)
				)
		);
	}

	public override async chatInputRun(interaction: ChatInputCommand.Interaction<'cached'>) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const subcommand = interaction.options.getSubcommand(true) as 'create' | 'delete' | 'edit' | 'list' | 'remove-participant';

		switch (subcommand) {
			case 'create':
				return this.createEvent(interaction);
			case 'list':
				return this.listEvents(interaction);
			case 'edit':
				return this.editEvent(interaction);
			case 'delete':
				return this.deleteEvent(interaction);
			case 'remove-participant': {
				return this.removeParticipant(interaction);
			}
		}
	}

	private async removeParticipant(interaction: ChatInputCommand.Interaction<'cached'>) {
		const id = interaction.options.getString('id', true);
		const participant = interaction.options.getUser('participant', true);

		const event = await this.container.prisma.event.findFirst({
			where: {
				id
			},
			select: {
				id: true,
				name: true,
				instance: {
					select: {
						id: true,
						participants: true
					}
				}
			}
		});

		if (!event?.instance?.participants.length) {
			throw new UserError({
				message: await resolveKey(interaction, 'commands/event:checksNoParticipantsFound', { eventName: event?.name ?? '' }),
				identifier: ErrorIdentifiers.RemoveParticipantNoParticipantsFound
			});
		}

		const participantData = event.instance.participants.find((eventParticipant) => eventParticipant.discordId === participant.id);

		if (!participantData) {
			throw new UserError({
				message: await resolveKey(interaction, 'commands/event:checksNotAParticipant', {
					participantMention: userMention(participant.id),
					eventName: event.name
				}),
				identifier: ErrorIdentifiers.RemoveParticipantNotFound
			});
		}

		await this.container.prisma.participant.delete({
			where: {
				eventInstanceId_discordId: {
					discordId: participant.id,
					eventInstanceId: event.instance.id
				}
			}
		});

		this.container.client.emit(XIVEventBuddyEvents.UpdateEmbed, {
			interaction,
			eventId: event.id,
			guildId: interaction.guildId,
			origin: UpdateEmbedPayloadOrigin.RemoveParticipantCommand
		});

		return interaction.editReply({
			content: await resolveKey(interaction, 'commands/event:removeParticipantSuccessful', {
				participantMention: userMention(participant.id),
				eventName: event.name
			})
		});
	}

	private async createEvent(interaction: ChatInputCommand.Interaction<'cached'>) {
		const { dateUnixTimestamp, dateIsInvalid } = this.validateStringDate(interaction.options.getString('date', true));

		if (dateIsInvalid) {
			return interaction.editReply({
				content: await resolveKey(interaction, 'commands/event:paramsInvalidDateFormat')
			});
		}

		const stringTime = interaction.options.getString('time', true);

		if (!this.timeRegex.test(stringTime)) {
			return interaction.editReply({
				content: await resolveKey(interaction, 'commands/event:paramsInvalidTimeFormat')
			});
		}

		const eventDate = this.setTimeAndTimezone(dateUnixTimestamp, stringTime);

		const channel = interaction.options.getChannel('channel', false);

		const eventChannel = channel ?? interaction.channel;

		if (!eventChannel?.isSendable()) {
			return interaction.editReply({
				content: await resolveKey(interaction, 'commands/event:paramsInvalidChannel')
			});
		}

		if (
			interaction.guild.members.me &&
			!eventChannel
				.permissionsFor(interaction.guild.members.me)
				?.has([PermissionFlagsBits.SendMessages, PermissionFlagsBits.ViewChannel, PermissionFlagsBits.EmbedLinks])
		) {
			return interaction.editReply({
				content: await resolveKey(interaction, 'commands/event:checksChannelPermissions', {
					viewChannel: await resolveKey(interaction, `permissions:ViewChannel`),
					sendMessages: await resolveKey(interaction, `permissions:SendMessages`),
					embedLinks: await resolveKey(interaction, `permissions:EmbedLinks`)
				})
			});
		}

		const name = interaction.options.getString('name', true);
		const description = interaction.options.getString('description', false);
		const interval = interaction.options.getString('interval', false);
		const roleToPing = interaction.options.getRole('role-to-ping', false);
		const secondRoleToPing = interaction.options.getRole('second-role-to-ping', false);
		const thirdRoleToPing = interaction.options.getRole('third-role-to-ping', false);
		const eventDuration = interaction.options.getInteger('duration', true);
		const leader = interaction.options.getUser('leader', false);
		const variant = interaction.options.getString('variant', false);

		const event = await this.container.prisma.event.create({
			data: {
				name,
				description,
				duration: eventDuration,
				channelId: eventChannel.id,
				guildId: interaction.guildId,
				interval: interval as $Enums.EventInterval,
				rolesToPing: [roleToPing?.id, secondRoleToPing?.id, thirdRoleToPing?.id].filter(filterNullish),
				leader: leader?.id ?? interaction.user.id,
				bannerImage: await this.getBannerImage(interaction),
				variant: (variant as $Enums.EventVariant | null) ?? $Enums.EventVariant.NORMAL,
				instance: {
					create: {
						dateTime: eventDate
					}
				}
			},
			select: {
				id: true,
				name: true,
				description: true,
				rolesToPing: true,
				leader: true,
				channelId: true,
				instance: {
					select: {
						dateTime: true,
						participants: {
							select: {
								job: true,
								role: true,
								signupOrder: true,
								discordId: true
							}
						}
					}
				}
			}
		});

		if (!event.instance) {
			return interaction.editReply({
				content: await resolveKey(interaction, 'commands/event:createUnexpectedError'),
				allowedMentions: { users: Owners }
			});
		}

		this.container.client.emit(XIVEventBuddyEvents.PostEmbed, { interaction, eventId: event.id, guildId: interaction.guildId });
		this.container.client.emit(XIVEventBuddyEvents.CreateServerEvent, {
			interaction,
			eventId: event.id,
			guildId: interaction.guildId,
			isReschedule: false,
			discordEventId: null
		});

		return interaction.editReply({
			content: await resolveKey(interaction, 'commands/event:createSuccessful', {
				eventName: inlineCode(name),
				eventId: inlineCode(event.id)
			})
		});
	}

	private async listEvents(interaction: ChatInputCommand.Interaction<'cached'>) {
		const eventInstances = await this.container.prisma.eventInstance.findMany({
			where: {
				event: {
					guildId: interaction.guildId
				}
			},
			select: {
				id: true,
				dateTime: true,
				event: {
					select: {
						name: true,
						description: true,
						rolesToPing: true,
						variant: true
					}
				}
			},
			orderBy: {
				dateTime: 'desc'
			}
		});

		if (eventInstances.length === 0) {
			return interaction.editReply({
				content: await resolveKey(interaction, 'commands/event:checksNoEventsFound')
			});
		}

		const eventIdHeader = heading('Event ID', 2);
		const eventListHeader = heading('Event List', 1);

		const variantMapping = {
			[$Enums.EventVariant.NORMAL]: `${XIVEventBuddyEmojis.XIVEventBuddy} Normal`,
			[$Enums.EventVariant.OCCULT_CRESCENT]: `${XIVEventBuddyEmojis.PhantomJob} Occult Crescent`
		};

		interface ListHeaders extends $Dictionary {
			date: string;
			description: string;
			name: string;
			roleToPing: string;
			time: string;
			variant: string;
		}

		const listHeaders = await resolveKey<string, { returnObjects: true }, ListHeaders>(interaction, 'commands/event:listHeaders');

		const eventList = eventInstances
			.map((eventInstance) => {
				const { id, dateTime, event } = eventInstance;
				const { name, description, rolesToPing, variant } = event;

				return [
					`${eventIdHeader}: ${id}`,
					unorderedList(
						[
							`**${listHeaders.name}:** ${name}`,
							`**${listHeaders.description}:** ${description}`,
							`**${listHeaders.date}:** ${time(dateTime, TimestampStyles.ShortDate)}`,
							`**${listHeaders.time}:** ${time(dateTime, TimestampStyles.ShortTime)}`,
							isNullishOrEmpty(rolesToPing) ? undefined : `**${listHeaders.roleToPing}:** ${rolesToPing.map(roleMention)}`,
							`**${listHeaders.variant}:** ${variantMapping[variant]}`
						].filter(filterNullish)
					)
				].join('\n');
			})
			.join('\n\n');

		const messageContent = [eventListHeader, eventList].join('\n');

		if (messageContent.length > 2_000) {
			const file = Buffer.from(messageContent, 'utf8');
			const filename = `event-list-${interaction.user.id}.txt`;

			return interaction.editReply({
				content: await resolveKey(interaction, 'commands/event:listContentTooLong'),
				files: [{ attachment: file, name: filename }]
			});
		}

		return interaction.editReply({
			content: messageContent
		});
	}

	private async editEvent(interaction: ChatInputCommand.Interaction<'cached'>) {
		const id = interaction.options.getString('id', true);

		const existingEvent = await this.container.prisma.event.findFirst({
			where: {
				id
			},
			select: {
				id: true,
				name: true,
				bannerImage: true,
				channelId: true,
				description: true,
				duration: true,
				interval: true,
				leader: true,
				rolesToPing: true,
				variant: true,
				instance: {
					select: {
						dateTime: true,
						messageId: true,
						discordEventId: true
					}
				}
			}
		});

		if (!existingEvent?.instance) {
			throw new UserError({
				message: await resolveKey(interaction, 'commands/event:checksNoEventFoundWithId', {
					eventId: inlineCode(id)
				}),
				identifier: ErrorIdentifiers.EventEditIdNotFound
			});
		}

		const stringDate = interaction.options.getString('date', false);
		let dateUnixTimestamp: number | null = null;
		let dateIsInvalid = false;

		if (stringDate) {
			const validatedStringDate = this.validateStringDate(stringDate);
			dateUnixTimestamp = validatedStringDate.dateUnixTimestamp;
			dateIsInvalid = validatedStringDate.dateIsInvalid;

			if (dateIsInvalid) {
				return interaction.editReply({
					content: await resolveKey(interaction, 'commands/event:paramsInvalidDateFormat')
				});
			}
		}

		let stringTime = interaction.options.getString('time', false);

		if (stringTime && !this.timeRegex.test(stringTime)) {
			return interaction.editReply({
				content: await resolveKey(interaction, 'commands/event:paramsInvalidTimeFormat')
			});
		}

		dateUnixTimestamp = dateUnixTimestamp ?? existingEvent.instance.dateTime.getTime();
		stringTime = stringTime ?? format(existingEvent.instance.dateTime, 'HH:mm');

		const eventDate = this.setTimeAndTimezone(dateUnixTimestamp, stringTime);

		const name = interaction.options.getString('name', false) ?? existingEvent.name;
		const description = interaction.options.getString('description', false) ?? existingEvent.description;
		const interval = interaction.options.getString('interval', false) ?? existingEvent.interval;
		const channel = interaction.options.getChannel('channel', false);
		const eventDuration = interaction.options.getInteger('duration', false);
		const roleToPing = interaction.options.getRole('role-to-ping', false);
		const secondRoleToPing = interaction.options.getRole('second-role-to-ping', false);
		const thirdRoleToPing = interaction.options.getRole('third-role-to-ping', false);
		const leader = interaction.options.getUser('leader', false);
		const variant = interaction.options.getString('variant', false);

		const resolvedEventChannel =
			channel ?? (existingEvent.channelId ? interaction.guild.channels.cache.get(existingEvent.channelId) : null) ?? interaction.channel;

		let rolesToPing = [roleToPing?.id, secondRoleToPing?.id, thirdRoleToPing?.id].filter(filterNullish);

		if (isNullishOrEmpty(rolesToPing)) {
			rolesToPing = existingEvent.rolesToPing;
		}

		if (!resolvedEventChannel?.isSendable()) {
			return interaction.editReply({
				content: await resolveKey(interaction, 'commands/event:paramsInvalidChannel')
			});
		}

		const updatedEvent = await this.container.prisma.event.update({
			where: {
				id
			},
			data: {
				name,
				description,
				channelId: resolvedEventChannel.id,
				guildId: interaction.guildId,
				interval: interval as $Enums.EventInterval,
				rolesToPing,
				leader: leader?.id ?? existingEvent.leader,
				bannerImage: (await this.getBannerImage(interaction)) ?? existingEvent.bannerImage,
				duration: eventDuration ?? existingEvent.duration,
				variant: (variant as $Enums.EventVariant | null) ?? existingEvent.variant,
				instance: {
					update: {
						dateTime: eventDate,
						discordEventId: existingEvent.instance.discordEventId
					}
				}
			},
			select: {
				id: true,
				name: true,
				bannerImage: true,
				channelId: true,
				createdAt: true,
				description: true,
				duration: true,
				interval: true,
				leader: true,
				rolesToPing: true,
				updatedAt: true,
				variant: true,
				instance: {
					include: {
						participants: true
					}
				}
			}
		});

		this.container.client.emit(XIVEventBuddyEvents.UpdateServerEvent, {
			interaction,
			eventId: updatedEvent.id,
			guildId: interaction.guildId
		});

		if (resolvedEventChannel.id === existingEvent.channelId) {
			this.container.client.emit(XIVEventBuddyEvents.UpdateEmbed, {
				interaction,
				eventId: updatedEvent.id,
				guildId: interaction.guildId,
				origin: UpdateEmbedPayloadOrigin.EditEventCommand
			});
		} else {
			const existingMessageChannel = await resolveOnErrorCodes(
				interaction.guild.channels.fetch(existingEvent.channelId),
				RESTJSONErrorCodes.UnknownChannel
			);

			if (existingMessageChannel?.isSendable() && existingEvent.instance.messageId) {
				const oldPostedMessage = await resolveOnErrorCodes(
					existingMessageChannel.messages.fetch(existingEvent.instance.messageId),
					RESTJSONErrorCodes.UnknownMessage
				);
				await oldPostedMessage?.delete();

				const postedMessage = await resolvedEventChannel.send({
					content: isNullishOrEmpty(updatedEvent.rolesToPing)
						? undefined
						: await resolveKey(interaction, 'globals:andListValue', { value: updatedEvent.rolesToPing.map(roleMention) }),
					embeds: [
						buildEventEmbed({
							event: updatedEvent as EventData,
							addToCalendarString: await resolveKey(interaction, 'globals:addToCalendar'),
							durationString: await resolveKey(interaction, 'globals:duration', {
								count: updatedEvent.duration
							})
						})
					],
					components:
						updatedEvent.variant === $Enums.EventVariant.NORMAL
							? await buildEventComponents(interaction, updatedEvent.id)
							: await buildPhantomJobComponent(interaction, updatedEvent.id),
					files: buildEventAttachment(updatedEvent as EventData),
					allowedMentions: { roles: isNullishOrEmpty(updatedEvent.rolesToPing) ? undefined : updatedEvent.rolesToPing }
				});

				await this.container.prisma.event.update({
					where: { id: updatedEvent.id },
					data: { instance: { update: { messageId: postedMessage.id } } }
				});
			}
		}

		return interaction.editReply({
			content: await resolveKey(interaction, 'commands/event:editEventSuccessful', {
				eventName: inlineCode(name)
			})
		});
	}

	private async deleteEvent(interaction: ChatInputCommand.Interaction<'cached'>) {
		const id = interaction.options.getString('id', true);

		const existingEvent = await this.container.prisma.event.findFirst({
			where: {
				id
			},
			select: {
				name: true,
				channelId: true,
				instance: {
					select: {
						messageId: true,
						discordEventId: true
					}
				}
			}
		});

		if (!existingEvent?.instance) {
			throw new UserError({
				message: await resolveKey(interaction, 'commands/event:checksNoEventFoundWithId', {
					eventId: inlineCode(id)
				}),
				identifier: ErrorIdentifiers.EventEditIdNotFound
			});
		}

		const resolvedEventChannel = interaction.guild.channels.cache.get(existingEvent.channelId);
		if (resolvedEventChannel?.isSendable() && existingEvent.instance.messageId) {
			try {
				const postedMessage = await resolveOnErrorCodes(
					resolvedEventChannel.messages.fetch(existingEvent.instance.messageId),
					RESTJSONErrorCodes.UnknownMessage
				);
				await postedMessage?.delete();
			} catch {
				// do nothing
			}
		}

		try {
			await this.container.prisma.event.delete({
				where: {
					id
				}
			});

			if (existingEvent.instance.discordEventId) {
				await resolveOnErrorCodes(
					interaction.guild.scheduledEvents.delete(existingEvent.instance.discordEventId),
					RESTJSONErrorCodes.UnknownGuildScheduledEvent
				);
			}

			return await interaction.editReply({
				content: await resolveKey(interaction, 'commands/event:deleteEventSuccessful', {
					eventName: inlineCode(existingEvent.name)
				})
			});
		} catch {
			return interaction.editReply({
				content: await resolveKey(interaction, 'commands/event:deleteUnexpectedError')
			});
		}
	}

	private validateStringDate(stringDate: string): { dateIsInvalid: boolean; dateUnixTimestamp: number } {
		const [day, month, year] = stringDate.includes('-') ? stringDate.split('-') : stringDate.split('/');
		const dateUnixTimestamp = Date.parse(`${year}-${month}-${day}`);
		const dateIsInvalid = Number.isNaN(dateUnixTimestamp);

		return { dateUnixTimestamp, dateIsInvalid };
	}

	private async getBannerImage(interaction: ChatInputCommand.Interaction<'cached'>): Promise<string | null> {
		const file = interaction.options.getAttachment('banner-image', false);

		if (!file || isNullishOrZero(file.width) || isNullishOrZero(file.height)) return null;

		const { width, height } = file;

		if (width <= 128 && height <= 128) return file.url;

		const url = new URL(file.url);
		if (width === height) {
			url.searchParams.append('width', '128');
			url.searchParams.append('height', '128');
		} else if (width > height) {
			url.searchParams.append('width', '128');
			url.searchParams.append('height', Math.ceil((height * 128) / width).toString());
		} else {
			url.searchParams.append('width', Math.ceil((width * 128) / height).toString());
			url.searchParams.append('height', '128');
		}

		const downloadedImage = await Result.fromAsync(fetch(url, FetchResultTypes.Buffer));

		return downloadedImage.match({
			ok: (value) => value.toString('base64'),
			err: () => null
		});
	}

	private setTimeAndTimezone(dateUnixTimestamp: number, stringTime: string): Date {
		const [hours, minutes] = stringTime.split(':').map(Number);
		const eventDate = new Date(dateUnixTimestamp);
		const isDstObserved = eventDate.getTimezoneOffset() < this.stdTimezoneOffset(eventDate);
		eventDate.setUTCHours(isDstObserved ? hours - 1 : hours, minutes, 0, 0);

		const ukTimezoneOffset = new Date().getTimezoneOffset() - eventDate.getTimezoneOffset();

		eventDate.setMinutes(eventDate.getMinutes() + ukTimezoneOffset);

		return eventDate;
	}

	private stdTimezoneOffset(today: Date) {
		const jan = new Date(today.getFullYear(), 0, 1);
		const jul = new Date(today.getFullYear(), 6, 1);
		return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
	}
}
