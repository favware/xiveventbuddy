import '../src/lib/types/Augments.d.ts';

import { PrismaPg } from '@prisma/adapter-pg';
import { envParseString, setup } from '@skyra/env-utilities';
import { PrismaClient } from '../src/lib/generated/prisma-client/client';

setup();

const adapter = new PrismaPg({
	connectionString: envParseString('DATABASE_URL')
});

const prisma = new PrismaClient({ adapter });

try {
	await prisma.eventManagers.create({
		data: {
			discordId: `902689970135896104`
		}
	});

	await prisma.$disconnect();
} catch (error) {
	console.error(error);
	await prisma.$disconnect();
	process.exit(1);
}
