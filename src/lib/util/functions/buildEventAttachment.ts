import type { EventData } from '#lib/util/constants';
import { AttachmentBuilder } from 'discord.js';

export function buildEventAttachment(event: EventData): AttachmentBuilder[] {
	if (!event.bannerImage) return [];
	return [new AttachmentBuilder(Buffer.from(event.bannerImage, 'base64'), { name: 'banner.png' })];
}
