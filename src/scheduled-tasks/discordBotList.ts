import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchMethods } from '@sapphire/fetch';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { envIsDefined, envParseString } from '@skyra/env-utilities';
import { blueBright } from 'colorette';
import { Status } from 'discord.js';

const header = blueBright('[POST COMMAND LIST   ]');

@ApplyOptions<ScheduledTask.Options>({
	// pattern: '0 0 * * *',
	pattern: '* * * * *',
	customJobOptions: {
		removeOnComplete: true
	}
})
export class DiscordBotList extends ScheduledTask {
	public override async run() {
		// If the websocket isn't ready, skip for now
		if (this.container.client.ws.status !== Status.Ready) {
			return;
		}

		this.container.logger.info(`${header} Posting to discordbotlist...`);

		// Fetch all events
		const commands = this.container.client.application?.commands.cache.toJSON();

		if (!commands) {
			return;
		}

		try {
			await fetch(`https://discordbotlist.com/api/v1/bots/${this.container.client.id}/commands`, {
				method: FetchMethods.Post,
				headers: {
					Authorization: envParseString('DISCORD_BOT_LIST_TOKEN'),
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(commands)
			});
		} catch (error) {
			this.container.logger.error(`Failed to update Discord Bot List commands: ${error}`);
		}
	}

	public override async onLoad() {
		const tokenIsDefined = envIsDefined('DISCORD_BOT_LIST_TOKEN');

		if (!tokenIsDefined) {
			await this.unload();
		}

		return super.onLoad();
	}
}
