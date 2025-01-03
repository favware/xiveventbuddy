import type { EventData } from '#lib/util/constants';

export function getPresentParticipants(event: EventData) {
	return event.instance.participants.filter((participant) => !['Absence', 'Late', 'Tentative'].includes(participant.role));
}

export function getAbsentParticipants(event: EventData) {
	return event.instance.participants.filter((participant) => participant.role === 'Absence');
}

export function getLateParticipants(event: EventData) {
	return event.instance.participants.filter((participant) => participant.role === 'Late');
}

export function getTentativeParticipants(event: EventData) {
	return event.instance.participants.filter((participant) => participant.role === 'Tentative');
}

export function getTankParticipants(event: EventData) {
	return event.instance.participants.filter((participant) => participant.role === 'Tank');
}

export function getMeleeDpsParticipants(event: EventData) {
	return event.instance.participants.filter((participant) => participant.role === 'MeleeDPS');
}

export function getPhysRangedDpsParticipants(event: EventData) {
	return event.instance.participants.filter((participant) => participant.role === 'PhysRangedDPS');
}

export function getMagicRangedDpsParticipants(event: EventData) {
	return event.instance.participants.filter((participant) => participant.role === 'MagicRangedDPS');
}

export function getHealerParticipants(event: EventData) {
	return event.instance.participants.filter((participant) => participant.role === 'Healer');
}

export function getAllRounderParticipants(event: EventData) {
	return event.instance.participants.filter((participant) => participant.role === 'AllRounder');
}
