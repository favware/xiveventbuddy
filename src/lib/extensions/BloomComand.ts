import { Command } from '@sapphire/framework';
import { PermissionFlagsBits } from 'discord.js';

export abstract class BloomCommand extends Command {
	public constructor(context: Command.LoaderContext, options: Command.Options) {
		super(context, {
			requiredClientPermissions: [PermissionFlagsBits.EmbedLinks, PermissionFlagsBits.CreateEvents, PermissionFlagsBits.ManageEvents],
			preconditions: ['IsEventManager', 'VerifiedServer'],
			...options
		});
	}
}
