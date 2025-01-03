import { BloomCommand } from '#lib/extensions/BloomComand';
import { BloombotEmojis } from '#lib/util/emojis';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry, Awaitable, ChatInputCommand } from '@sapphire/framework';
import { heading, unorderedList, time, TimestampStyles, roleMention } from 'discord.js';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Manage the Nightbloom events'
})
export class SlashCommand extends BloomCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
		registry.registerChatInputCommand((command) =>
			command //
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand((builder) =>
					builder //
						.setName('create')
						.setDescription('Create a new event')
				)
				.addSubcommand((builder) =>
					builder //
						.setName('list')
						.setDescription('List all currently known events and their IDs. Future scheduled events will not be listed.')
				)
				.addSubcommand((builder) =>
					builder //
						.setName('edit')
						.setDescription('Edit an existing event.')
				)
				.addSubcommand((builder) =>
					builder //
						.setName('delete')
						.setDescription('Deletes an existing event.')
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

	private async createEvent(_interaction: ChatInputCommand.Interaction<'cached'>) {}

	private async listEvents(interaction: ChatInputCommand.Interaction<'cached'>) {
		const eventInstances = await this.container.prisma.eventInstance.findMany({
			select: {
				id: true,
				date: true,
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
				const { id, date, event } = eventInstance;
				const { name, description, roleToPing } = event;

				return [
					`${eventIdHeader}: ${id}`,
					unorderedList([
						`**Name:** ${name}`,
						`**Description:** ${description}`,
						`**Date:** ${time(date, TimestampStyles.ShortDate)}`,
						`**Time:** ${time(date, TimestampStyles.ShortTime)}`,
						`**Roles to ping:** ${roleMention(roleToPing)}`
					])
				].join('\n');
			})
			.join('\n\n');

		const messageContent = [eventListHeader, eventList].join('\n');

		return interaction.editReply({
			content: messageContent
		});
	}

	private async editEvent(_interaction: ChatInputCommand.Interaction<'cached'>) {}

	private async deleteEvent(_interaction: ChatInputCommand.Interaction<'cached'>) {}
}
