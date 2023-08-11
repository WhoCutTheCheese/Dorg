import Bans from "../schemas/Bans";
import { client } from "../Main";

export async function checkBans() {
	let bans = await Bans.find({
		banExpiredUnix: { $lt: Date.now() }
	});

	if (!bans || bans.length <= 0) return;

	bans.forEach(async (ban) => {
		let user = await client.users.fetch(ban.userID!).catch(() => { });
		if (!user) return;

		let guild = await client.guilds.fetch(ban.guildID!).catch(() => { });
		if (!guild) return;

		await guild.members.unban(user, "Ban expired.");

		await ban.deleteOne(
			{
				guildID: ban.guildID,
				userID: ban.userID,
				endDate: ban.endDate
			}
		);
	})
}

setInterval(checkBans, 1 * 1000); 