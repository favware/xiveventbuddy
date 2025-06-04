import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
