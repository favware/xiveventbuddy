import { PrismaClient } from '@prisma/client';
import { container } from '@sapphire/framework';

const prisma = new PrismaClient();
container.prisma = prisma;

export type prismaType = typeof prisma;
