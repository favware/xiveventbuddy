import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import type { ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>, content: InteractionHandler.ParseResult<this>) {
		const file = Buffer.from(content, 'utf8');
		const filename = `server-data-${new Date().toISOString()}.json`;

		return interaction.update({
			content: await resolveKey(interaction, 'interactionHandlers:serverBreakdownContentTooLong'),
			files: [{ attachment: file, name: filename }]
		});
	}

	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (interaction.customId !== 'server-breakdown') return this.none();

		const dbDataForServer = await this.container.prisma.event.findMany({
			select: {
				name: true,
				description: true,
				variant: true,
				leader: true,
				guildId: true,
				instance: {
					select: {
						dateTime: true,
						participants: {
							select: {
								discordId: true,
								job: true,
								role: true
							}
						}
					}
				}
			}
		});

		const serverData = this.container.client.guilds.cache.map((guild) => ({
			id: guild.id,
			name: guild.name,
			memberCount: guild.memberCount || guild.approximateMemberCount,
			createdAt: guild.joinedAt.toISOString(),
			ownerId: guild.ownerId,
			preferredLocale: guild.preferredLocale
		}));

		const combinedData = serverData.map((guild) => ({
			...guild,
			events: dbDataForServer.filter((event) => event.guildId === guild.id)
		}));

		return this.some(JSON.stringify(combinedData, null, 4));
	}
}
