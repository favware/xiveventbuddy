import { CustomIdPrefixes } from '#lib/util/constants';
import { handleJobOrRoleButtonClick } from '#lib/util/functions/handleJobOrRoleButtonClick';
import { $Enums } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { resolveKey } from '@sapphire/plugin-i18next';
import { inlineCode, type ButtonInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Button
})
export class ButtonHandler extends InteractionHandler {
	public override async run(interaction: ButtonInteraction<'cached'>) {
		return interaction.editReply({
			content: await resolveKey(interaction, 'interactionHandlers:successfullyUpdatedStatus', { statusName: inlineCode($Enums.Roles.Bench) })
		});
	}

	public override async parse(interaction: ButtonInteraction<'cached'>) {
		if (!interaction.customId.startsWith(CustomIdPrefixes.RoleBench)) return this.none();

		await handleJobOrRoleButtonClick(interaction, $Enums.Roles.Bench);

		return this.some();
	}
}
