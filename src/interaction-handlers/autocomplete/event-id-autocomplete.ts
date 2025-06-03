import { ApplyOptions } from '@sapphire/decorators';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { isNullishOrEmpty } from '@sapphire/utilities';
import { jaroWinkler } from '@skyra/jaro-winkler';
import type { ApplicationCommandOptionChoiceData, AutocompleteInteraction } from 'discord.js';

@ApplyOptions<InteractionHandler.Options>({
	interactionHandlerType: InteractionHandlerTypes.Autocomplete
})
export class AutocompleteHandler extends InteractionHandler {
	public override async run(interaction: AutocompleteInteraction<'cached'>, result: InteractionHandler.ParseResult<this>) {
		return interaction.respond(result);
	}

	public override async parse(interaction: AutocompleteInteraction<'cached'>) {
		if (interaction.commandName !== 'event') return this.none();

		const focusedOption = interaction.options.getFocused(true);

		if (focusedOption.name === 'id') {
			const allEvents = await this.container.prisma.event.findMany({
				where: {
					guildId: interaction.guildId
				},
				select: {
					id: true,
					name: true
				}
			});

			if (isNullishOrEmpty(allEvents)) {
				return this.some([]);
			}

			if (isNullishOrEmpty(focusedOption.value)) {
				return this.some(allEvents.slice(0, 20).map((event) => ({ name: `Name: ${event.name}`, value: event.id })));
			}

			return this.some(this.fuzzySearch(focusedOption.value, allEvents));
		}

		return this.none();
	}

	private fuzzySearch(query: string, values: EventSelection[]) {
		const results: EventSelectionWithSimilarity[] = [];
		const threshold = 0.3;
		const lowerCaseQuery = query.toLowerCase();

		let similarity: number;
		let almostExacts = 0;

		for (const value of values) {
			const lowerCaseName = value.name.toLowerCase();

			if (lowerCaseName === lowerCaseQuery) {
				similarity = 1;
			} else {
				similarity = jaroWinkler(lowerCaseQuery, value.name.toLowerCase());
			}

			if (similarity < threshold) continue;

			results.push({ ...value, similarity });
			if (similarity > 0.9) almostExacts++;
			if (almostExacts === 10) break;
		}

		if (!results.length) return [];

		return results
			.toSorted((a, b) => b.similarity - a.similarity)
			.slice(0, 20)
			.map<ApplicationCommandOptionChoiceData>((result) => ({ name: `Name: ${result.name}`, value: result.id }));
	}
}

interface EventSelection {
	id: string;
	name: string;
}

interface EventSelectionWithSimilarity extends EventSelection {
	similarity: number;
}
