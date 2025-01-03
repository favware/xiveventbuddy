import { BloomCommand } from '#lib/extensions/BloomComand';
import { BloombotEmojis } from '#lib/util/emojis';
import { ApplyOptions } from '@sapphire/decorators';
import type { ApplicationCommandRegistry, Awaitable, ChatInputCommand } from '@sapphire/framework';
import { filterNullish, toTitleCase } from '@sapphire/utilities';
import { heading, roleMention, unorderedList } from 'discord.js';

@ApplyOptions<ChatInputCommand.Options>({
	description: 'Manage existing schedules'
})
export class SlashCommand extends BloomCommand {
	public override registerApplicationCommands(registry: ApplicationCommandRegistry): Awaitable<void> {
		registry.registerChatInputCommand((command) =>
			command //
				.setName(this.name)
				.setDescription(this.description)
				.addSubcommand((builder) =>
					builder //
						.setName('list')
						.setDescription('List all currently known schedules and their IDs.')
				)
				.addSubcommand((builder) =>
					builder //
						.setName('edit')
						.setDescription('Edit an existing schedule.')
				)
				.addSubcommand((builder) =>
					builder //
						.setName('delete')
						.setDescription('Deletes an existing schedule.')
				)
		);
	}

	public override async chatInputRun(interaction: ChatInputCommand.Interaction<'cached'>) {
		await interaction.deferReply({ ephemeral: true });

		const subcommand = interaction.options.getSubcommand(true) as 'list' | 'edit' | 'delete';

		switch (subcommand) {
			case 'list':
				return this.listSchedules(interaction);
			case 'edit':
				return this.editSchedule(interaction);
			case 'delete':
				return this.deleteSchedule(interaction);
		}
	}

	private async listSchedules(interaction: ChatInputCommand.Interaction<'cached'>) {
		const schedules = await this.container.prisma.event.findMany({
			select: {
				id: true,
				name: true,
				description: true,
				interval: true,
				roleToPing: true
			}
		});

		if (schedules.length === 0) {
			return interaction.editReply({
				content: `${BloombotEmojis.RedCross} No schedules found.`
			});
		}

		const eventIdHeader = heading('Schedule ID', 2);
		const eventListHeader = heading('Schedules List', 1);

		const eventList = schedules
			.map((eventInstance) => {
				const { id, description, interval, name, roleToPing } = eventInstance;

				return [
					`${eventIdHeader}: ${id}`,
					unorderedList(
						[
							`**Name:** ${name}`,
							`**Description:** ${description}`,
							interval ? `**Interval:** ${toTitleCase(interval.toLowerCase())}` : undefined,
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

	private async editSchedule(_interaction: ChatInputCommand.Interaction<'cached'>) {}

	private async deleteSchedule(_interaction: ChatInputCommand.Interaction<'cached'>) {}
}
