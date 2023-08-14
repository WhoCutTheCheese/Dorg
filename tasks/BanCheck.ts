import Bans from "../schemas/Bans";
import { client } from "../Main";
import Case from "../schemas/Case";

export async function checkBans() {
	let bans = await Bans.find({
		banExpiredUnix: { $lt: Date.now() / 1000 }
	});

	if (!bans || bans.length <= 0) return;

	bans.forEach(async (ban) => {
		let user = await client.users.fetch(ban.userID!).catch(() => { });
		if (!user) return;

		let guild = await client.guilds.fetch(ban.guildID!).catch(() => { });
		if (!guild) return;

		const theCase = await Case.findOneAndUpdate({
			guildID: guild.id,
			caseNumber: ban.caseNumber,
		}, {
			active: false
		});

		if (theCase?.active == true) return;

		await guild.members.unban(user, "Ban expired.");


		await ban.deleteOne(
			{
				guildID: ban.guildID,
				userID: ban.userID,
				endDate: ban.endDate
			}
		);
	});
}

setInterval(checkBans, 1 * 1000); 