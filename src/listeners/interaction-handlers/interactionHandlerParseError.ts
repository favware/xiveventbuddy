import { handleInteractionError } from '#utils/functions/interactionErrorHandler';
import { Listener, type Events, type InteractionHandlerParseError } from '@sapphire/framework';

export class UserListener extends Listener<typeof Events.InteractionHandlerParseError> {
	public run(error: Error, payload: InteractionHandlerParseError) {
		return handleInteractionError(error, payload);
	}
}
