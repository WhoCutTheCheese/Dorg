import RoleBans from "../schemas/RoleBans";
import { client } from "../Main";
import Case from "../schemas/Case";

export async function checkRoleBans() {
	let usersBanned = await RoleBans.find({
		endDate: { $lt: Math.floor(Date.now() / 1000), $gt: 0 }
	});

	if (!usersBanned || usersBanned.length <= 0) return;

	usersBanned.forEach(async (file) => {
		let user = await client.users.fetch(file.userID!).catch(() => { });
		if (!user) {
			await file.deleteOne();
			console.log("No user found!");
			return;
		}

		let guild = await client.guilds.fetch(file.guildID!).catch(() => { });
		if (!guild) {
			await file.deleteOne();
			console.log("No guild found!");
			return;
		}

		await Case.findOneAndUpdate({
			guildID: guild.id,
			caseNumber: file.caseNumber,
		}, {
			active: false
		});

		await guild.members.cache.get(user.id)?.roles.remove(file.roleID!).catch(() => { console.log("Err 1!"); });


		await file.deleteOne(
			{
				guildID: file.guildID,
				userID: file.userID,
				endDate: file.endDate
			}
		);
	});
}

setInterval(checkRoleBans, 1 * 1000); 