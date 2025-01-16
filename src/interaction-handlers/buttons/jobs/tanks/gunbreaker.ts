import { CustomIdPrefixes } from '#lib/util/constants';
import { BloombotEmojis } from '#lib/util/emojis';
import { handleJobOrRoleButtonClick } from '#lib/util/functions/handleJobOrRoleButtonClick';
import { $Enums } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { inlineCode, type ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>) {
		return interaction.editReply({
			content: `${BloombotEmojis.GreenTick} Successfully updated your job to ${inlineCode($Enums.Jobs.Gunbreaker)}.`
		});
	}

	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!interaction.customId.startsWith(`${CustomIdPrefixes.Job}-${CustomIdPrefixes.Gunbreaker}`)) return this.none();

		await handleJobOrRoleButtonClick(interaction, $Enums.Roles.Tank, $Enums.Jobs.Gunbreaker);

		return this.some();
	}
}
