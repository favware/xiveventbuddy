import { rootFolder } from '#lib/util/constants';
import { Owners } from '#root/config';
import { isMessageInstance } from '@sapphire/discord.js-utilities';
import {
	ArgumentError,
	container,
	Events,
	UserError,
	type ChatInputCommandErrorPayload,
	type Command,
	type ContextMenuCommandErrorPayload
} from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { codeBlock, isNullish } from '@sapphire/utilities';
import {
	bold,
	DiscordAPIError,
	EmbedBuilder,
	hideLinkEmbed,
	HTTPError,
	hyperlink,
	MessageFlags,
	RESTJSONErrorCodes,
	userMention,
	type APIMessage,
	type BaseInteraction,
	type CommandInteraction,
	type Message
} from 'discord.js';
import { fileURLToPath } from 'node:url';

export const ignoredCodes = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

export async function handleChatInputOrContextMenuCommandError(
	error: Error,
	{ command, interaction }: ChatInputCommandErrorPayload | ContextMenuCommandErrorPayload
) {
	// If the error was a string or an UserError, send it to the user:
	if (typeof error === 'string') return stringError(interaction, error);
	if (error instanceof ArgumentError) return userError(interaction, error);
	if (error instanceof UserError) return userError(interaction, error);

	const { client, logger } = container;
	// If the error was an AbortError or an Internal Server Error, tell the user to re-try:
	if (error.name === 'AbortError' || error.message === 'Internal Server Error') {
		logger.warn(`${getWarnError(interaction)} (${interaction.user.id}) | ${error.constructor.name}`);
		return alert(interaction, await resolveKey(interaction, 'errors:networkError'));
	}

	// Extract useful information about the DiscordAPIError
	if (error instanceof DiscordAPIError || error instanceof HTTPError) {
		if (ignoredCodes.includes(error.status)) {
			return;
		}

		client.emit(Events.Error, error);
	} else {
		logger.warn(`${getWarnError(interaction)} (${interaction.user.id}) | ${error.constructor.name}`);
	}

	// Send a detailed message:
	await sendErrorChannel(interaction, command, error);

	// Emit where the error was emitted
	logger.fatal(`[COMMAND] ${command.location.full}\n${error.stack ?? error.message}`);
	try {
		await alert(interaction, await generateUnexpectedErrorMessage(interaction, error));
	} catch (error) {
		client.emit(Events.Error, error as Error);
	}

	return undefined;
}

export async function generateUnexpectedErrorMessage(interaction: BaseInteraction | null, error: Error | UserError) {
	let body = await resolveKey(interaction!, 'errors:unexpectedError', {
		stacktrace: codeBlock('js', error.stack ?? error.message),
		lng: isNullish(interaction) ? 'en-US' : undefined
	});

	if (error instanceof UserError && error.context) {
		body += await resolveKey(interaction!, 'errors:unexpectedErrorAdditionalContext', {
			context: codeBlock('json', JSON.stringify(error.context, null, 2)),
			lng: isNullish(interaction) ? 'en-US' : undefined
		});
	}

	return body;
}

export async function stringError(interaction: BaseInteraction, error: string) {
	return alert(
		interaction,
		await resolveKey(interaction, 'errors:dearPrefix', {
			user: userMention(interaction.user.id),
			error
		})
	);
}

export async function userError(interaction: BaseInteraction, error: UserError) {
	return alert(interaction, error.message ?? (await resolveKey(interaction, 'errors: userError')));
}

async function alert(interaction: BaseInteraction, content: string) {
	if (!interaction.isStringSelectMenu() && !interaction.isButton()) return;

	if (interaction.replied || interaction.deferred) {
		return interaction.editReply({
			content,
			allowedMentions: { users: [...new Set([interaction.user.id, ...Owners])], roles: [] }
		});
	}

	return interaction.reply({
		content,
		allowedMentions: { users: [...new Set([interaction.user.id, ...Owners])], roles: [] },
		flags: MessageFlags.Ephemeral
	});
}

async function sendErrorChannel(interaction: CommandInteraction, command: Command, error: Error) {
	const webhook = container.webhookError;
	if (isNullish(webhook)) return;

	const interactionReply = await interaction.fetchReply();

	const lines = [
		getLinkLine(interactionReply), //
		getCommandLine(command),
		getOptionsLine(interaction.options),
		getErrorLine(error)
	];

	// If it's a DiscordAPIError or a HTTPError, add the HTTP path and code lines after the second one.
	if (error instanceof DiscordAPIError || error instanceof HTTPError) {
		lines.splice(2, 0, getMethodLine(error), getStatusLine(error));
	}

	const embed = new EmbedBuilder() //
		.setDescription(lines.join('\n'))
		.setColor('Red')
		.setTimestamp();

	try {
		await webhook.send({ embeds: [embed] });
	} catch (error_) {
		container.client.emit(Events.Error, error_ as Error);
	}
}

/**
 * Formats a command line.
 *
 * @param command - The command to format.
 */
function getCommandLine(command: Command): string {
	return `**Command**: ${command.location.full.slice(fileURLToPath(rootFolder).length)}`;
}

/**
 * Formats an options line.
 *
 * @param options - The options the user used when running the command.
 */
function getOptionsLine(options: CommandInteraction['options']): string {
	if (options.data.length === 0) return '**Options**: Not Supplied';

	const mappedOptions = [];

	for (const option of options.data) {
		let { value } = option;
		if (typeof value === 'string') value = value.trim().replaceAll('`', '῾');

		mappedOptions.push(`[${option.name} ⫸ ${value ?? '\u200B'}]`);
	}

	if (mappedOptions.length === 0) return '**Options**: Not Supplied';

	return `**Options**: ${mappedOptions.join('\n')}`;
}

/**
 * Formats a message url line.
 *
 * @param message - The message to format.
 */
export function getLinkLine(message: APIMessage | Message): string {
	if (isMessageInstance(message)) {
		return bold(hyperlink('Jump to Message!', hideLinkEmbed(message.url)));
	}

	return '';
}

/**
 * Formats an error method line.
 *
 * @param error - The error to format.
 */
export function getMethodLine(error: DiscordAPIError | HTTPError): string {
	return `**Path**: ${error.method.toUpperCase()}`;
}

/**
 * Formats an error status line.
 *
 * @param error - The error to format.
 */
export function getStatusLine(error: DiscordAPIError | HTTPError): string {
	return `**Status**: ${error.status}`;
}

/**
 * Formats an error codeblock.
 *
 * @param error - The error to format.
 */
export function getErrorLine(error: Error): string {
	if (error instanceof Error) {
		return `**Error**: ${codeBlock('js', error.stack ?? error.message)}`;
	}

	return `**Error**: ${codeBlock('js', error)}`;
}

export function getWarnError(interaction: BaseInteraction) {
	return `ERROR: /${interaction.guildId}/${interaction.channelId}/${interaction.id}`;
}
