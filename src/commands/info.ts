import { secondsFromMilliseconds } from '#lib/util/functions/time';
import { BrandingColors } from '#utils/constants';
import { ApplyOptions } from '@sapphire/decorators';
import { Command, version as sapphireVersion, type ChatInputCommand } from '@sapphire/framework';
import { applyLocalizedBuilder, resolveKey } from '@sapphire/plugin-i18next';
import { roundNumber } from '@sapphire/utilities';
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	EmbedBuilder,
	OAuth2Scopes,
	PermissionFlagsBits,
	PermissionsBitField,
	TimestampStyles,
	hideLinkEmbed,
	hyperlink,
	time,
	version
} from 'discord.js';
import { cpus, uptime, type CpuInfo } from 'node:os';

@ApplyOptions<ChatInputCommand.Options>({
	requiredClientPermissions: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.CreateEvents, PermissionFlagsBits.ManageEvents]
})
export class SlashCommand extends Command {
	public override registerApplicationCommands(registry: ChatInputCommand.Registry) {
		registry.registerChatInputCommand((builder) => applyLocalizedBuilder(builder, 'commands/info:root'));
	}

	public override async chatInputRun(interaction: ChatInputCommand.Interaction) {
		return interaction.reply({
			//
			embeds: [await this.getEmbed(interaction)],
			components: this.components,
			ephemeral: true
		});
	}

	private get components(): ActionRowBuilder<ButtonBuilder>[] {
		return [
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder() //
					.setStyle(ButtonStyle.Link)
					.setURL(this.inviteLink)
					.setLabel('Add me to your server!')
					.setEmoji({
						name: '🎉'
					}),
				new ButtonBuilder() //
					.setStyle(ButtonStyle.Link)
					.setURL('https://discord.gg/sguypX8')
					.setLabel('Support server')
					.setEmoji({
						name: '🆘'
					})
			),
			new ActionRowBuilder<ButtonBuilder>().addComponents(
				new ButtonBuilder() //
					.setStyle(ButtonStyle.Link)
					.setURL('https://github.com/favware/xiveventbuddy')
					.setLabel('GitHub Repository')
					.setEmoji({
						id: '950888087188283422',
						name: 'github2'
					}),
				new ButtonBuilder() //
					.setStyle(ButtonStyle.Link)
					.setURL('https://github.com/sponsors/favna')
					.setLabel('Donate')
					.setEmoji({
						name: '🧡'
					})
			)
		];
	}

	private get inviteLink() {
		return this.container.client.generateInvite({
			scopes: [OAuth2Scopes.Bot, OAuth2Scopes.ApplicationsCommands],
			permissions: new PermissionsBitField([
				PermissionFlagsBits.ViewChannel,
				PermissionFlagsBits.ReadMessageHistory,
				PermissionFlagsBits.SendMessages,
				PermissionFlagsBits.EmbedLinks
			])
		});
	}

	private async getEmbed(interaction: Command.ChatInputCommandInteraction): Promise<EmbedBuilder> {
		const titles = {
			stats: 'Statistics',
			uptime: 'Uptime',
			serverUsage: 'Server Usage'
		};
		const stats = this.generalStatistics;
		const uptime = this.uptimeStatistics;
		const usage = await this.getUsageStatistics(interaction);

		const translationHeaders = await resolveKey<string, { returnObjects: true }, EmbedTranslationHeaders>(interaction, 'commands/info:fields');

		const fields = {
			stats: [
				//
				`• **${translationHeaders.stats.users}**: ${stats.users}`,
				`• **${translationHeaders.stats.servers}**: ${stats.guilds}`,
				`• **${translationHeaders.stats.channels}**: ${stats.channels}`,
				`• **${translationHeaders.stats.nodejs}**: ${stats.nodeJs}`,
				`• **${translationHeaders.stats.discordjs}**: ${stats.version}`,
				`• **${translationHeaders.stats.sapphire}**: ${stats.sapphireVersion}`
			].join('\n'),
			uptime: [
				//
				`• **${translationHeaders.uptime.host}**: ${uptime.host}`,
				`• **${translationHeaders.uptime.total}**: ${uptime.total}`,
				`• **${translationHeaders.uptime.client}**: ${uptime.client}`
			].join('\n'),
			serverUsage: [
				//
				`• **${translationHeaders.usage.cpuLoad}**: ${usage.cpuLoad}`,
				`• **${translationHeaders.usage.heapUsed}**: ${usage.ramUsed}MB (Total: ${usage.ramTotal}MB)`
			].join('\n')
		};

		return new EmbedBuilder() //
			.setColor(BrandingColors.Primary)
			.setDescription(
				await resolveKey(interaction, 'commands/info:embedDescription', {
					sapphire: hyperlink('Sapphire Framework', hideLinkEmbed('https://sapphirejs.dev')),
					discordjs: hyperlink('discord.js', hideLinkEmbed('https://discord.js.org'))
				})
			)
			.setFields(
				{
					name: titles.stats,
					value: fields.stats,
					inline: true
				},
				{
					name: titles.uptime,
					value: fields.uptime
				},
				{
					name: titles.serverUsage,
					value: fields.serverUsage
				}
			);
	}

	private get generalStatistics(): StatsGeneral {
		const { client } = this.container;
		return {
			channels: client.channels.cache.size,
			guilds: client.guilds.cache.size,
			nodeJs: process.version,
			users: client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0),
			version: `v${version}`,
			sapphireVersion: `v${sapphireVersion}`
		};
	}

	private get uptimeStatistics(): StatsUptime {
		const now = Date.now();
		const nowSeconds = roundNumber(now / 1_000);
		return {
			client: time(secondsFromMilliseconds(now - this.container.client.uptime!), TimestampStyles.RelativeTime),
			host: time(roundNumber(nowSeconds - uptime()), TimestampStyles.RelativeTime),
			total: time(roundNumber(nowSeconds - process.uptime()), TimestampStyles.RelativeTime)
		};
	}

	private async getUsageStatistics(interaction: Command.ChatInputCommandInteraction): Promise<StatsUsage> {
		const usage = process.memoryUsage();

		return {
			cpuLoad: cpus().slice(0, 2).map(SlashCommand.formatCpuInfo.bind(null)).join(' | '),
			ramTotal: await resolveKey(interaction, 'globals:numberValue', { value: usage.heapTotal / 1_048_576 }),
			ramUsed: await resolveKey(interaction, 'globals:numberValue', { value: usage.heapUsed / 1_048_576 })
		};
	}

	private static formatCpuInfo({ times }: CpuInfo) {
		return `${roundNumber(((times.user + times.nice + times.sys + times.irq) / times.idle) * 10_000) / 100}%`;
	}
}

interface StatsGeneral {
	channels: number;
	guilds: number;
	nodeJs: string;
	sapphireVersion: string;
	users: number;
	version: string;
}

interface StatsUptime {
	client: string;
	host: string;
	total: string;
}

interface StatsUsage {
	cpuLoad: string;
	ramTotal: string;
	ramUsed: string;
}

export interface EmbedTranslationHeaders {
	stats: {
		channels: string;
		discordjs: string;
		nodejs: string;
		sapphire: string;
		servers: string;
		users: string;
	};
	uptime: {
		client: string;
		host: string;
		total: string;
	};
	usage: {
		cpuLoad: string;
		heapUsed: string;
		total: string;
	};
}
