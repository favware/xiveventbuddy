import { rootFolder } from '#lib/util/constants';
import { Owners } from '#root/config';
import {
	generateUnexpectedErrorMessage,
	getErrorLine,
	getLinkLine,
	getMethodLine,
	getStatusLine,
	getWarnError,
	stringError,
	userError
} from '#utils/functions/errorHelpers';
import {
	ArgumentError,
	container,
	Events,
	UserError,
	type InteractionHandler,
	type InteractionHandlerError,
	type InteractionHandlerParseError
} from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { isNullish } from '@sapphire/utilities';
import { DiscordAPIError, EmbedBuilder, HTTPError, MessageFlags, RESTJSONErrorCodes, type Interaction } from 'discord.js';
import { fileURLToPath } from 'node:url';

const ignoredCodes = [RESTJSONErrorCodes.UnknownChannel, RESTJSONErrorCodes.UnknownMessage];

export async function handleInteractionError(error: Error, { handler, interaction }: InteractionHandlerError | InteractionHandlerParseError) {
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
	await sendErrorChannel(interaction, handler, error);

	// Emit where the error was emitted
	logger.fatal(`[COMMAND] ${handler.location.full}\n${error.stack ?? error.message}`);
	try {
		await alert(interaction, await generateUnexpectedErrorMessage(interaction, error));
	} catch (error) {
		client.emit(Events.Error, error as Error);
	}

	return undefined;
}

async function alert(interaction: Interaction, content: string) {
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

async function sendErrorChannel(interaction: Interaction, handler: InteractionHandler, error: Error) {
	const webhook = container.webhookError;
	if (isNullish(webhook) || (!interaction.isStringSelectMenu() && !interaction.isButton())) return;

	const interactionReply = await interaction.fetchReply();

	const lines = [getLinkLine(interactionReply), getHandlerLine(handler), getErrorLine(error)];

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
	} catch (error) {
		container.client.emit(Events.Error, error as Error);
	}
}

/**
 * Formats a handler line.
 *
 * @param handler - The handler to format.
 */
function getHandlerLine(handler: InteractionHandler): string {
	return `**Handler**: ${handler.location.full.slice(fileURLToPath(rootFolder).length)}`;
}
