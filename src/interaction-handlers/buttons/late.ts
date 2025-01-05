import { BloombotEmojis } from '#lib/util/emojis';
import { handleRoleButtonClick } from '#lib/util/functions/handleRoleButtonClick';
import { $Enums } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { inlineCode, type ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class AutocompleteHandler extends InteractionHandler {
	public override run(interaction: ButtonInteraction) {
		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Successfully updated your status to ${inlineCode($Enums.Roles.Late)}.`
		});
	}

	public override async parse(interaction: ButtonInteraction) {
		if (!interaction.customId.startsWith('role-late')) return this.none();

		await handleRoleButtonClick(interaction, $Enums.Jobs.AllRounder, $Enums.Roles.Late);

		return this.some();
	}
}
