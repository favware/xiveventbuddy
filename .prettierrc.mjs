import sapphirePrettierConfig from '@sapphire/prettier-config';

export default {
	...sapphirePrettierConfig,
	overrides: [
		...sapphirePrettierConfig.overrides,
		{
			files: ['*.md'],
			options: {
				printWidth: 120,
				proseWrap: 'always'
			}
		}
	]
};
