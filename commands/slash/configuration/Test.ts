import { BaseMessageOptions, ButtonStyle, Message, PermissionFlagsBits } from "discord.js";
import { client } from "../../../Main";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import { EmbedType, MessageResponse } from "../../../classes/MessageResponse";

export default new CommandExecutor()
	.setName("test")
	.setDescription("Testing")
	.setBasePermission({
		Level: PermissionLevel.Developer,
	})
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setExecutor(async (interaction) => {
		interaction.reply(`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}`);
	});
