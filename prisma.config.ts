import { setup } from '@skyra/env-utilities';
import { defineConfig, env } from 'prisma/config';

setup();

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations',
		seed: 'unrun prisma/initial-data-seed.ts'
	},
	datasource: {
		url: env('DATABASE_URL')
	}
});
