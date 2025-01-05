// Config must be the first to be loaded, as it sets the env:
import '#root/config';
import '@sapphire/plugin-logger/register';

import type { BloombotEvents, UpdateEmbedPayload } from '#lib/util/constants';
import { PrismaClient } from '@prisma/client';
import { ApplicationCommandRegistries, container, RegisterBehavior } from '@sapphire/framework';
import * as colorette from 'colorette';
import { inspect } from 'util';

const prisma = new PrismaClient();

inspect.defaultOptions.depth = 1;
colorette.createColors({ useColor: true });
ApplicationCommandRegistries.setDefaultBehaviorWhenNotIdentical(RegisterBehavior.BulkOverwrite);
container.prisma = prisma;

declare module '@sapphire/pieces' {
	interface Container {
		prisma: typeof prisma;
	}
}

declare module '@sapphire/framework' {
	interface Preconditions {
		VerifiedServer: never;
		IsEventManager: never;
	}

	interface SapphireClient {
		emit(event: BloombotEvents.UpdateEmbed, payload: UpdateEmbedPayload): boolean;
	}
}

declare module '@skyra/env-utilities' {
	interface Env {
		CLIENT_ID: string;
		CLIENT_VERSION: string;
		CLIENT_PRESENCE_NAME: string;
		CLIENT_PRESENCE_TYPE: string;

		COMMAND_GUILD_ID: string;

		DISCORD_TOKEN: string;

		DATABASE_URL: string;
	}
}
