import { defineConfig } from 'tsdown';

export default defineConfig({
	clean: true,
	entry: ['src/**', '!src/locales/**'],
	dts: false,
	root: 'src',
	unbundle: true,
	minify: false,
	deps: { skipNodeModulesBundle: true },
	sourcemap: true,
	target: 'es2024',
	tsconfig: 'src/tsconfig.json',
	treeshake: true,
	format: 'esm'
});
