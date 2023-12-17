import Bans from "../schemas/Bans";
import { client } from "../Main";
import { GuildMember, Role } from "discord.js";

export async function checkForUnverifiedVerified() {
	const guild = await client.guilds.fetch("1079964060872880229");
	const unverified = await guild.roles.fetch("1139101213690970172");
	if (!unverified) return;

	unverified?.members.forEach(async (member: GuildMember) => {
		if (!member.roles.cache.find((r: Role) => r.name.toLowerCase() === "member")) return;
		member.roles.remove(unverified);
	});
}

setInterval(checkForUnverifiedVerified, 1 * 1000); 