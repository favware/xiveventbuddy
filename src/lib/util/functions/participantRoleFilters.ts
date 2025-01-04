import type { EventData } from '#lib/util/constants';
import { $Enums } from '@prisma/client';

export type FilteredParticipant = Pick<
	{
		id: string;
		createdAt: Date;
		updatedAt: Date;
		eventId: string;
		role: $Enums.Roles;
		job: $Enums.Jobs;
		discordId: string;
		signupOrder: number;
	},
	'role' | 'job' | 'discordId' | 'signupOrder'
>;

export function getBenchedParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === 'Bench');
}

export function getPresentParticipants(event: EventData): FilteredParticipant[] {
	const excludedRoles: Array<$Enums.Roles> = [$Enums.Roles.Absence, $Enums.Roles.Bench, $Enums.Roles.Late, $Enums.Roles.Tentative];
	return event.instance.participants.filter((participant) => !excludedRoles.includes(participant.role));
}

export function getAbsentParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === 'Absence');
}

export function getLateParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === 'Late');
}

export function getTentativeParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === 'Tentative');
}

export function getTankParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === 'Tank');
}

export function getMeleeDpsParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === 'MeleeDPS');
}

export function getPhysRangedDpsParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === 'PhysRangedDPS');
}

export function getMagicRangedDpsParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === 'MagicRangedDPS');
}

export function getHealerParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === 'Healer');
}

export function getAllRounderParticipants(event: EventData): FilteredParticipant[] {
	return event.instance.participants.filter((participant) => participant.role === 'AllRounder');
}
