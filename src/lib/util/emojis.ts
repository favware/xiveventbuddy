import type { Emojis } from '#lib/util/constants';
import { formatEmoji } from 'discord.js';

export const BloombotEmojis: Record<Emojis, string> = {
	// Jobs
	Astrologian: formatEmoji('1324558618640646146', false),
	Bard: formatEmoji('1324558620435943494', false),
	BlackMage: formatEmoji('1324558622595879012', false),
	BlueMage: formatEmoji('1324558623984189560', false),
	Dancer: formatEmoji('1324558625884340336', false),
	DarkKnight: formatEmoji('1324558627230453800', false),
	Dragoon: formatEmoji('1324558631085019226', false),
	Gunbreaker: formatEmoji('1324558631995441244', false),
	Machinist: formatEmoji('1324558636579557518', false),
	Monk: formatEmoji('1324558638551011340', false),
	Ninja: formatEmoji('1324558640878977066', false),
	Paladin: formatEmoji('1324558643164614676', false),
	Pictomancer: formatEmoji('1324558645505167470', false),
	Reaper: formatEmoji('1324558646423719938', false),
	RedMage: formatEmoji('1324558648047046708', false),
	Sage: formatEmoji('1324558649015664783', false),
	Samurai: formatEmoji('1324558649917575188', false),
	Scholar: formatEmoji('1324558651414810836', false),
	Summoner: formatEmoji('1324558654401282069', false),
	Viper: formatEmoji('1324558658322960477', false),
	Warrior: formatEmoji('1324558658922745887', false),
	WhiteMage: formatEmoji('1324558660285759538', false),

	// Job Types
	AllRounder: formatEmoji('1324558617193746502', false),
	DPS: formatEmoji('1324558629202038826', false),
	Healer: formatEmoji('1324558633224114289', false),
	MeleeDPS: formatEmoji('1324558637288394869', false),
	MagicRangedDPS: formatEmoji('1324558639893315625', false),
	PhysRangedDPS: formatEmoji('1324558644448067694', false),
	Tank: formatEmoji('1324558655202398279', false),

	// Event Data
	Absence: formatEmoji('1324558615939649559', false),
	Bench: formatEmoji('1324558621530521681', false),
	Countdown: formatEmoji('1324558624634441842', false),
	Date: formatEmoji('1324558628207726633', false),
	Late: formatEmoji('1324558634243457117', false),
	Leader: formatEmoji('1324558635413671987', false),
	Signups: formatEmoji('1324558651997818953', false),
	SpecReset: formatEmoji('1324558653319151690', false),
	Tentative: formatEmoji('1324558656326467616', false),
	Time: formatEmoji('1324558657341362247', false),

	// Other
	RedCross: formatEmoji('1324572748130947143', false),
	GreenTick: formatEmoji('1324572747069915188', false)
} as const;
