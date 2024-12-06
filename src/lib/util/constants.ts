import { URL } from 'node:url';

export const rootFolder = new URL('../../../', import.meta.url);
export const srcFolder = new URL('src/', rootFolder);

export const enum BrandingColors {
	Primary = 0xbb77ea
}

export const enum ErrorIdentifiers {}
