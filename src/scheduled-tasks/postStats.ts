import { ApplyOptions } from '@sapphire/decorators';
import { fetch, FetchMediaContentTypes, FetchMethods, FetchResultTypes, QueryError } from '@sapphire/fetch';
import { Result } from '@sapphire/framework';
import { ScheduledTask } from '@sapphire/plugin-scheduled-tasks';
import { filterNullish, isNullishOrEmpty } from '@sapphire/utilities';
import { envIsDefined, envParseString } from '@skyra/env-utilities';
import { blueBright, green, red } from 'colorette';
import { Status } from 'discord.js';

const header = blueBright('[POST STATS   ]');

enum Lists {
	BotListMe = 'botlist.me',
	Discordbotlist = 'discordbotlist.com',
	Discords = 'discords.com',
	TopGG = 'top.gg'
}

@ApplyOptions<ScheduledTask.Options>({
	pattern: '0 * * * *',
	customJobOptions: {
		removeOnComplete: true
	}
})
export class PostStats extends ScheduledTask {
	public override async run() {
		// If the websocket isn't ready, skip for now
		if (this.container.client.ws.status !== Status.Ready) {
			return;
		}

		this.container.logger.debug(`${header} Starting task...`);

		const rawGuilds = this.container.client.guilds.cache.size;
		const rawUsers = this.container.client.guilds.cache.reduce((acc, val) => acc + (val.memberCount ?? 0), 0);

		await this.processBotListStats(rawGuilds, rawUsers);
	}

	public override async onLoad() {
		if (envParseString('NODE_ENV') !== 'production') {
			await this.unload();
		}

		const discordBotListTokenIsDefined = envIsDefined('DISCORD_BOT_LIST_TOKEN');
		// const topGgTokenIsDefined = envIsDefined('TOP_GG_TOKEN');
		// const botListMeTokenIsDefined = envIsDefined('BOTLIST_ME_TOKEN');
		const discordTokenIsDefined = envIsDefined('DISCORDS_TOKEN');

		if (
			!discordBotListTokenIsDefined ||
			//  !topGgTokenIsDefined||
			//   !botListMeTokenIsDefined ||
			!discordTokenIsDefined
		) {
			await this.unload();
		}

		return super.onLoad();
	}

	private async processBotListStats(rawGuilds: number, rawUsers: number) {
		const botId = this.container.client.id;

		const guilds = rawGuilds.toString();
		const users = rawUsers.toString();

		const results: (string | null)[] = (
			await Promise.all([
				// this.query(
				// 	`https://top.gg/api/bots/${botId}/stats`,
				// 	// TODO: API impl
				// 	JSON.stringify({ server_count: guilds, shard_count: 1 }),
				// 	envParseString('TOP_GG_TOKEN'),
				// 	Lists.TopGG
				// ),
				this.query(
					`https://discords.com/bots/api/bot/${botId}/setservers`,
					JSON.stringify({ server_count: guilds }),
					envParseString('DISCORDS_TOKEN'),
					Lists.Discords
				),
				// this.query(
				// 	`https://api.botlist.me/api/v1/bots/${botId}/stats`,
				// 	// TODO: API impl
				// 	JSON.stringify({ server_count: guilds, shard_count: 1 }),
				// 	`Bot ${envParseString('BOTLIST_ME_TOKEN')}`,
				// 	Lists.BotListMe
				// ),
				this.query(
					`https://discordbotlist.com/api/v1/bots/${botId}/stats`,
					JSON.stringify({ users, guilds, voice_connections: 0, shard_id: 1 }),
					`Bot ${envParseString('DISCORD_BOT_LIST_TOKEN')}`,
					Lists.Discordbotlist
				)
			])
		).filter(filterNullish);

		if (results.length) {
			this.container.logger.debug(`${header} [ ${guilds} [G] ] [ ${users} [U] ] | ${results.join(' | ')}`);
		}
	}

	private async query(url: string, body: string, token: string | null, list: Lists) {
		if (isNullishOrEmpty(token)) {
			return null;
		}

		const result = await Result.fromAsync(async () => {
			await fetch(
				url,
				{
					body,
					headers: {
						'content-type': FetchMediaContentTypes.JSON,
						authorization: token
					},
					method: FetchMethods.Post
				},
				FetchResultTypes.Result
			);

			return green(list);
		});

		return result.match({
			ok: (data) => data,
			err: (error) => {
				const errorMessage =
					error instanceof QueryError
						? JSON.stringify({
								body: error.body,
								code: error.code,
								response: error.response,
								url: error.url,
								cause: error.cause,
								message: error.message
							})
						: error instanceof Error
							? JSON.stringify({
									message: error.message,
									stack: error.stack,
									cause: error.cause,
									name: error.name
								}) //
							: 'Unknown error occurred!!';

				return `${red(list)} [${red(errorMessage)}]`;
			}
		});
	}
}
