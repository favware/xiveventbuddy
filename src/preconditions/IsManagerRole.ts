import { Precondition } from '@sapphire/framework';
import type { ChatInputCommandInteraction } from 'discord.js';

export class UserPrecondition extends Precondition {
	public override chatInputRun(_interaction: ChatInputCommandInteraction) {
		// TODO: check the role of the user against the database
		return this.ok();
	}
}
