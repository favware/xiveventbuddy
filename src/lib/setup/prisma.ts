import { container } from '@sapphire/framework';
import { PrismaClient } from '#lib/generated/prisma-client/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { envParseString } from '@skyra/env-utilities';

const adapter = new PrismaPg({
	connectionString: envParseString('DATABASE_URL')
});

const prisma = new PrismaClient({ adapter });

container.prisma = prisma;

export type prismaType = typeof prisma;
