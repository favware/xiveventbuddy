import { setup } from '@skyra/env-utilities';
import { defineConfig, env } from 'prisma/config';

setup();

export default defineConfig({
	schema: 'prisma/schema.prisma',
	migrations: {
		path: 'prisma/migrations'
	},
	datasource: {
		url: env('DATABASE_URL')
	}
});
