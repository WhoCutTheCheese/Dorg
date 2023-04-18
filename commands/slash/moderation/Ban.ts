import { Message, PermissionFlagsBits } from "discord.js";
import { client } from "../../../Main";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";

export default new CommandExecutor()
	.setName("ban")
	.setDescription("Ban a user from The Bot Den.")
	.setBasePermission({
		Level: PermissionLevel.Moderator,
	})
	.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
	.setExecutor(async (interaction) => {

	});
