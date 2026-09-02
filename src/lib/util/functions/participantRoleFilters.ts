import { $Enums, type Participant } from '#lib/generated/prisma-client/client';
import type { EventData } from '#lib/util/constants';

export type FilteredParticipant = Pick<Participant, 'discordId' | 'job' | 'role' | 'signupOrder'>;

export function getBenchedParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === $Enums.Roles.Bench);
}

export const nonPresentEventRoles: $Enums.Roles[] = [$Enums.Roles.Absence, $Enums.Roles.Bench, $Enums.Roles.Late, $Enums.Roles.Tentative];
export function getPresentParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => !nonPresentEventRoles.includes(participant.role));
}

export function getAbsentParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === $Enums.Roles.Absence);
}

export function getLateParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === $Enums.Roles.Late);
}

export function getTentativeParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === $Enums.Roles.Tentative);
}

export function getTankParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === $Enums.Roles.Tank);
}

export function getMeleeDpsParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === $Enums.Roles.MeleeDPS);
}

export function getPhysRangedDpsParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === $Enums.Roles.PhysRangedDPS);
}

export function getMagicRangedDpsParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === $Enums.Roles.MagicRangedDPS);
}

export function getHealerParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === $Enums.Roles.Healer);
}

export function getPhantomJobParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === $Enums.Roles.PhantomJob);
}

export function getAllRounderParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === $Enums.Roles.AllRounder);
}
