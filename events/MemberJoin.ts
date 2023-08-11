import { GuildMember, Role } from "discord.js";
import { config } from "../utilities/Config";
import { Log } from "../utilities/Logging";
import mongoose from "mongoose";

export default {
	name: "guildMemberAdd",
	once: false,
	async execute(member: GuildMember) {
		if (member.roles.cache.find((r: Role) => r.name.toLowerCase() === "member")) return;

        member.roles.add("1139101213690970172")
	}
};