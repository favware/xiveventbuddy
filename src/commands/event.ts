import { BloomCommand } from '#lib/extensions/BloomComand';
import { BloombotEvents, ErrorIdentifiers, type EventData } from '#lib/util/constants';
import { BloombotEmojis } from '#lib/util/emojis';
import { buildEventComponents } from '#lib/util/functions/buildEventComponents';
import { buildEventEmbed } from '#lib/util/functions/buildEventEmbed';
import { OwnerMentions, Owners } from '#root/config';
import { Interval } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { UserError, type ApplicationCommandRegistry, type Awaitable, type ChatInputCommand } from '@sapphire/framework';
import { filterNullish } from '@sapphire/utilities';
import { format } from 'date-fns/format';
import { heading, inlineCode, MessageFlags, roleMention, time, TimestampStyles, unorderedList } from 'discord.js';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Manage the Nightbloom events'
})
export class SlashCommand extends BloomCommand {
	private readonly timeRegex = /^(0\d|1\d|2[0-4]):[0-5]\d$/;

	public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
		registry.registerChatInputCommand((command) =>
			command //
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand((builder) =>
					builder
						.setName('create')
						.setDescription('Create a new event')
						.addStringOption((builder) =>
							builder //
								.setName('name')
								.setDescription('The name of the event')
								.setRequired(true)
						)
						.addStringOption((builder) =>
							builder //
								.setName('date')
								.setDescription('The date of the event, or first occurrence if interval is set. Format is DD-MM-YYYY or DD/MM/YYYY')
								.setRequired(true)
						)
						.addStringOption((builder) =>
							builder //
								.setName('time')
								.setDescription('The time of the event. Format is HH:MM (24 hour clock). Time is always Light server time (UTC)')
								.setRequired(true)
						)
						.addStringOption((builder) =>
							builder //
								.setName('description')
								.setDescription('The description of the event, for newlines type \\n')
								.setRequired(false)
						)
						.addStringOption((builder) =>
							builder //
								.setName('interval')
								.setDescription('The interval at which this event should repeat')
								.setRequired(false)
								.setChoices(
									{ name: 'Daily', value: Interval.DAILY },
									{ name: 'Weekly', value: Interval.WEEKLY },
									{ name: 'Biweekly', value: Interval.BIWEEKLY },
									{ name: 'Monthly', value: Interval.MONTHLY },
									{ name: 'Yearly', value: Interval.YEARLY }
								)
						)
						.addRoleOption((builder) =>
							builder //
								.setName('role-to-ping')
								.setDescription('A role to ping when the event is created')
								.setRequired(false)
						)
						.addChannelOption((builder) =>
							builder //
								.setName('channel')
								.setDescription('The channel in which the event should posted, if omitted the current channel is used.')
								.setRequired(false)
						)
				)
				.addSubcommand((builder) =>
					builder //
						.setName('list')
						.setDescription('List all currently known events and their IDs. Future scheduled events will not be listed.')
				)
				.addSubcommand((builder) =>
					builder
						.setName('edit')
						.setDescription('Edit an existing event.')
						.addStringOption((builder) =>
							builder
								.setName('id')
								.setDescription('The command id, use /event list to get a list, or type the event name for autocomplete.')
								.setAutocomplete(true)
								.setRequired(true)
						)
						.addStringOption((builder) =>
							builder //
								.setName('name')
								.setDescription('The new name of the event')
								.setRequired(false)
						)
						.addStringOption((builder) =>
							builder //
								.setName('date')
								.setDescription('The new date of the event. Format is DD-MM-YYYY or DD/MM/YYYY')
								.setRequired(false)
						)
						.addStringOption((builder) =>
							builder //
								.setName('time')
								.setDescription('The new time of the event. Format is HH:MM (24 hour clock). Time is always Light server time (UTC)')
								.setRequired(false)
						)
						.addStringOption((builder) =>
							builder //
								.setName('description')
								.setDescription('The new description of the event, for newlines type \\n')
								.setRequired(false)
						)
						.addStringOption((builder) =>
							builder //
								.setName('interval')
								.setDescription('The new interval at which this event should repeat')
								.setRequired(false)
								.setChoices(
									{ name: 'Daily', value: Interval.DAILY },
									{ name: 'Weekly', value: Interval.WEEKLY },
									{ name: 'Biweekly', value: Interval.BIWEEKLY },
									{ name: 'Monthly', value: Interval.MONTHLY },
									{ name: 'Yearly', value: Interval.YEARLY }
								)
						)
						.addRoleOption((builder) =>
							builder //
								.setName('role-to-ping')
								.setDescription('The new role to ping for the event')
								.setRequired(false)
						)
						.addChannelOption((builder) =>
							builder //
								.setName('channel')
								.setDescription('The channel in which the event should posted, if omitted the current channel is used.')
								.setRequired(false)
						)
						.addUserOption((builder) =>
							builder //
								.setName('leader')
								.setDescription('The new event leader for this event.')
								.setRequired(false)
						)
				)
				.addSubcommand((builder) =>
					builder //
						.setName('delete')
						.setDescription('Deletes an existing event.')
						.addStringOption((builder) =>
							builder
								.setName('id')
								.setDescription('The command id, use /event list to get a list, or type the event name for autocomplete.')
								.setAutocomplete(true)
								.setRequired(true)
						)
				)
		);
	}

	public override async chatInputRun(interaction: ChatInputCommand.Interaction<'cached'>) {
		await interaction.deferReply({ flags: MessageFlags.Ephemeral });

		const subcommand = interaction.options.getSubcommand(true) as 'create' | 'list' | 'edit' | 'delete';

		switch (subcommand) {
			case 'create':
				return this.createEvent(interaction);
			case 'list':
				return this.listEvents(interaction);
			case 'edit':
				return this.editEvent(interaction);
			case 'delete':
				return this.deleteEvent(interaction);
		}
	}

	private validateStringDate(stringDate: string): { dateUnixTimestamp: number; dateIsInvalid: boolean } {
		const [day, month, year] = stringDate.includes('-') ? stringDate.split('-') : stringDate.split('/');
		const dateUnixTimestamp = Date.parse(`${year}-${month}-${day}`);
		const dateIsInvalid = isNaN(dateUnixTimestamp);

		return { dateUnixTimestamp, dateIsInvalid };
	}

	private setEventTimeAndTimezone(dateUnixTimestamp: number, stringTime: string): Date {
		const [hours, minutes] = stringTime.split(':').map(Number);
		const eventDate = new Date(dateUnixTimestamp);
		eventDate.setUTCHours(hours, minutes, 0, 0);

		const ukTimezoneOffset = new Date().getTimezoneOffset() - eventDate.getTimezoneOffset();

		eventDate.setMinutes(eventDate.getMinutes() + ukTimezoneOffset);

		return eventDate;
	}

	private async createEvent(interaction: ChatInputCommand.Interaction<'cached'>) {
		const { dateUnixTimestamp, dateIsInvalid } = this.validateStringDate(interaction.options.getString('date', true));

		if (dateIsInvalid) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} The date you provided is invalid, it has to be in the format of ${inlineCode('DD-MM-YYY')} or ${inlineCode('DD/MM/YYY')}.`
			});
		}

		const stringTime = interaction.options.getString('time', true);

		if (!this.timeRegex.test(stringTime)) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} The time you provided is invalid, it has to be in the format of ${inlineCode('HH:MM')}.`
			});
		}

		const eventDate = this.setEventTimeAndTimezone(dateUnixTimestamp, stringTime);

		const channel = interaction.options.getChannel('channel', false);

		const eventChannel = channel ?? interaction.channel;

		if (!eventChannel?.isSendable()) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} The channel you provided is invalid.`
			});
		}

		const name = interaction.options.getString('name', true);
		const description = interaction.options.getString('description', false);
		const interval = interaction.options.getString('interval', false);
		const roleToPing = interaction.options.getRole('role-to-ping', false);

		const event = await this.container.prisma.event.create({
			data: {
				name,
				description,
				channelId: eventChannel.id,
				interval: interval as Interval,
				roleToPing: roleToPing?.id,
				leader: interaction.user.id,
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
				roleToPing: true,
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
				content: `${BloombotEmojis.RedCross} An unexpected fatal error occurred while creating the event. Contact ${OwnerMentions} for assistance.`,
				allowedMentions: { users: Owners }
			});
		}

		const postedMessage = await eventChannel.send({
			content: event.roleToPing ? roleMention(event.roleToPing) : undefined,
			embeds: [buildEventEmbed(event as EventData)],
			components: buildEventComponents(event.id, interaction.user.id),
			allowedMentions: { roles: event.roleToPing ? [event.roleToPing] : undefined }
		});

		await this.container.prisma.event.update({
			where: { id: event.id },
			data: { instance: { update: { messageId: postedMessage.id } } }
		});

		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Event ${inlineCode(name)} created successfully with ID ${inlineCode(event.id)}.`
		});
	}

	private async listEvents(interaction: ChatInputCommand.Interaction<'cached'>) {
		const eventInstances = await this.container.prisma.eventInstance.findMany({
			select: {
				id: true,
				dateTime: true,
				event: {
					select: {
						name: true,
						description: true,
						roleToPing: true
					}
				}
			}
		});

		if (eventInstances.length === 0) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} No events found.`
			});
		}

		const eventIdHeader = heading('Event ID', 2);
		const eventListHeader = heading('Event List', 1);

		const eventList = eventInstances
			.map((eventInstance) => {
				const { id, dateTime, event } = eventInstance;
				const { name, description, roleToPing } = event;

				return [
					`${eventIdHeader}: ${id}`,
					unorderedList(
						[
							`**Name:** ${name}`,
							`**Description:** ${description}`,
							`**Date:** ${time(dateTime, TimestampStyles.ShortDate)}`,
							`**Time:** ${time(dateTime, TimestampStyles.ShortTime)}`,
							roleToPing ? `**Role to ping:** ${roleMention(roleToPing)}` : undefined
						].filter(filterNullish)
					)
				].join('\n');
			})
			.join('\n\n');

		const messageContent = [eventListHeader, eventList].join('\n');

		return interaction.editReply({
			content: messageContent
		});
	}

	private async editEvent(interaction: ChatInputCommand.Interaction<'cached'>) {
		const id = interaction.options.getString('id', true);

		const existingEvent = await this.container.prisma.event.findFirstOrThrow({
			where: {
				id
			},
			select: {
				id: true,
				name: true,
				description: true,
				roleToPing: true,
				channelId: true,
				interval: true,
				leader: true,
				instance: {
					select: {
						dateTime: true,
						messageId: true
					}
				}
			}
		});

		if (!existingEvent?.instance) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} No event found with ID ${inlineCode(id)}.`
			});
		}

		const stringDate = interaction.options.getString('date', false);
		let dateUnixTimestamp: number | null = null;
		let dateIsInvalid: boolean = false;

		if (stringDate) {
			const validatedStringDate = this.validateStringDate(stringDate);
			dateUnixTimestamp = validatedStringDate.dateUnixTimestamp;
			dateIsInvalid = validatedStringDate.dateIsInvalid;

			if (dateIsInvalid) {
				return interaction.editReply({
					content: `${BloombotEmojis.RedCross} The date you provided is invalid, it has to be in the format of ${inlineCode('DD-MM-YYY')} or ${inlineCode('DD/MM/YYY')}.`
				});
			}
		}

		let stringTime = interaction.options.getString('time', false);

		if (stringTime && !this.timeRegex.test(stringTime)) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} The time you provided is invalid, it has to be in the format of ${inlineCode('HH:MM')}.`
			});
		}

		dateUnixTimestamp = dateUnixTimestamp ?? existingEvent.instance.dateTime.getTime();
		stringTime = stringTime ?? format(existingEvent.instance.dateTime, 'HH:mm');

		const eventDate = this.setEventTimeAndTimezone(dateUnixTimestamp, stringTime);

		const name = interaction.options.getString('name', false) ?? existingEvent.name;
		const description = interaction.options.getString('description', false) ?? existingEvent.description;
		const interval = interaction.options.getString('interval', false) ?? existingEvent.interval;
		const channel = interaction.options.getChannel('channel', false);
		const roleToPing = interaction.options.getRole('role-to-ping', false);
		const leader = interaction.options.getUser('leader', false);

		const resolvedEventChannel =
			channel ?? (existingEvent.channelId ? interaction.guild.channels.cache.get(existingEvent.channelId) : null) ?? interaction.channel;

		if (!resolvedEventChannel?.isSendable()) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} The channel you provided is invalid.`
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
				interval: interval as Interval,
				roleToPing: roleToPing?.id ?? existingEvent.roleToPing,
				leader: leader?.id ?? existingEvent.leader,
				instance: {
					update: {
						dateTime: eventDate
					}
				}
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
					include: {
						participants: true
					}
				}
			}
		});

		if (resolvedEventChannel.id === existingEvent.channelId) {
			this.container.client.emit(BloombotEvents.UpdateEmbed, { eventId: updatedEvent.id, interaction });
		} else {
			const existingMessageChannel = await interaction.guild.channels.fetch(existingEvent.channelId);

			if (existingMessageChannel?.isSendable() && existingEvent.instance.messageId) {
				const oldPostedMessage = await existingMessageChannel.messages.fetch(existingEvent.instance.messageId);
				await oldPostedMessage.delete();

				const postedMessage = await resolvedEventChannel.send({
					content: updatedEvent.roleToPing ? roleMention(updatedEvent.roleToPing) : undefined,
					embeds: [buildEventEmbed(updatedEvent as EventData)],
					components: buildEventComponents(updatedEvent.id, interaction.user.id),
					allowedMentions: { roles: updatedEvent.roleToPing ? [updatedEvent.roleToPing] : undefined }
				});

				await this.container.prisma.event.update({
					where: { id: updatedEvent.id },
					data: { instance: { update: { messageId: postedMessage.id } } }
				});
			}
		}

		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Event ${inlineCode(name)} successfully updated.`
		});
	}

	private async deleteEvent(interaction: ChatInputCommand.Interaction<'cached'>) {
		const id = interaction.options.getString('id', true);

		const existingEvent = await this.container.prisma.event.findFirstOrThrow({
			where: {
				id
			},
			select: {
				channelId: true,
				instance: {
					select: {
						messageId: true
					}
				}
			}
		});

		if (!existingEvent?.instance) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} No event found with ID ${inlineCode(id)}.`
			});
		}

		const resolvedEventChannel = interaction.guild.channels.cache.get(existingEvent.channelId);

		if (!resolvedEventChannel) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} The channel the event was posted could not be found, was it maybe deleted?.`
			});
		}

		if (resolvedEventChannel.isSendable()) {
			try {
				const postedMessage = await resolvedEventChannel.messages.fetch(existingEvent.instance.messageId!);

				if (postedMessage) {
					await postedMessage.delete();
				} else {
					throw new UserError({
						message: `${BloombotEmojis.RedCross} I was unexpectedly unable to posted event message. Contact ${OwnerMentions} for assistance.`,
						identifier: ErrorIdentifiers.EventEditPostedMessageUndefinedError
					});
				}
			} catch (error) {
				throw new UserError({
					message: `${BloombotEmojis.RedCross} I was unexpectedly unable to posted event message. Contact ${OwnerMentions} for assistance.`,
					identifier: ErrorIdentifiers.EventEditMessageFetchFailedError
				});
			}
		} else {
			throw new UserError({
				message: `${BloombotEmojis.RedCross} I was unexpectedly unable to find the channel the event was posted in. Contact ${OwnerMentions} for assistance.`,
				identifier: ErrorIdentifiers.EventEditMessageChannelNotFoundError
			});
		}

		try {
			await this.container.prisma.event.delete({
				where: {
					id
				}
			});

			return interaction.editReply({
				content: `${BloombotEmojis.GreenTick} Event with ID ${inlineCode(id)} successfully deleted.`
			});
		} catch (error) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} Failed to delete the event from the database. Contact ${OwnerMentions} for assistance.`
			});
		}
	}
}
