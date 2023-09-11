import { GuildMember, Role } from "discord.js";
import { config } from "../utilities/Config";
import { Log } from "../utilities/Logging";
import mongoose from "mongoose";
import RoleBans from "../schemas/RoleBans";

export default {
	name: "guildMemberAdd",
	once: false,
	async execute(member: GuildMember) {
		setTimeout(async () => {
			if (member.roles.cache.find((r: Role) => r.name.toLowerCase() === "member")) {
				const foundBan = await RoleBans.find({
					guildID: member.guild?.id,
					userID: member.id,
				});
				if (foundBan) {
					for (const file of foundBan) {
						if (!member?.roles.cache.has(file.roleID!)) {
							member?.roles.add(file.roleID!).catch(() => { });
						}
					}
				}
				const fetchedMembers = await member.guild.members.fetch();
				const humans = fetchedMembers.filter((member: GuildMember) => !member.user.bot).size;
				if (humans < 100) {
					const role = member.guild.roles.cache.find((r: Role) => r.name.toLowerCase() == "early supporter🌲");
					if (role) await member.roles.add(role);
				}
				return;
			}
			await member.roles.add("1139101213690970172");
		}, 1000);

	}
};