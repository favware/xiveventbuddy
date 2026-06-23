import type { $Enums } from '#lib/generated/prisma-client/client';

export function formatPhantomJobName(job: $Enums.Jobs) {
	return job.replaceAll(/(?<capital>[A-Z])/g, ' $<capital>').trim();
}
