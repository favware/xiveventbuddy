import { BloomCommand } from '#lib/extensions/BloomComand';
import type { EventData } from '#lib/util/constants';
import { BloombotEmojis } from '#lib/util/emojis';
import { buildEventEmbed } from '#lib/util/functions/buildEventEmbed';
import { OwnerMentions, Owners } from '#root/config';
import { Interval } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry, Awaitable, ChatInputCommand } from '@sapphire/framework';
import { filterNullish } from '@sapphire/utilities';
import { heading, inlineCode, roleMention, time, TimestampStyles, unorderedList } from 'discord.js';

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
		await interaction.deferReply({ ephemeral: true });

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
			// components: [buildEventComponents(event as EventData)],
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

		const id = interaction.options.getString('id', true);

		const eventForId = await this.container.prisma.event.findFirst({
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
						messageId: true,
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

		if (!eventForId) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} No event found with ID ${inlineCode(id)}.`
			});
		}

		const name = interaction.options.getString('name', true);
		const description = interaction.options.getString('description', false);
		const interval = interaction.options.getString('interval', false);
		const roleToPing = interaction.options.getRole('role-to-ping', false);

		const event = await this.container.prisma.event.update({
			where: {
				id
			},
			data: {
				name: name ?? eventForId.name,
				description: description ?? eventForId.description,
				channelId: eventChannel.id ?? eventForId.channelId,
				interval: (interval as Interval) ?? eventForId.interval,
				roleToPing: roleToPing?.id ?? eventForId.roleToPing,
				leader: interaction.user.id ?? eventForId.leader,
				instance: {
					update: {
						dateTime: eventDate ?? eventForId.instance?.dateTime
					}
				}
			},
			select: {
				id: true,
				name: true,
				description: true,
				roleToPing: true,
				leader: true,
				instance: {
					select: {
						dateTime: true,
						messageId: true,
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

		const postedMessageChannel = await interaction.guild.channels.fetch(eventChannel.id);

		if (postedMessageChannel?.isSendable() && event.instance?.messageId) {
			// "https://discord.com/api/v10/channels/838895947052089366/messages/1324894872305533010"
			// guild id: 838895946397646850 channel id: 902281783196921857
			// message link: https://discord.com/channels/838895946397646850/902281783196921857/1324894872305533010
			try {
				const postedMessage = await postedMessageChannel.messages.fetch(event.instance.messageId);

				if (postedMessage) {
					await postedMessage.edit({
						content: event.roleToPing ? roleMention(event.roleToPing) : undefined,
						embeds: [buildEventEmbed(event as EventData)],
						// components: [buildEventComponents(event as EventData)],
						allowedMentions: { roles: event.roleToPing ? [event.roleToPing] : undefined }
					});
				} else {
					return interaction.editReply({
						content: `${BloombotEmojis.RedCross} I was unexpectedly unable to posted event message. Contact ${OwnerMentions} for assistance.`,
						allowedMentions: { users: Owners }
					});
				}
			} catch (error) {
				return interaction.editReply({
					content: `${BloombotEmojis.RedCross} I was unexpectedly unable to posted event message. Contact ${OwnerMentions} for assistance.`,
					allowedMentions: { users: Owners }
				});
			}
		} else {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} I was unexpectedly unable to find the channel the event was posted in. Contact ${OwnerMentions} for assistance.`,
				allowedMentions: { users: Owners }
			});
		}

		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Event ${inlineCode(name)} successfully updated.`
		});
	}

	private async deleteEvent(_interaction: ChatInputCommand.Interaction<'cached'>) {}
}
