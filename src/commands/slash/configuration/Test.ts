import { PermissionFlagsBits } from "discord.js";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import { getUsedRAM, getMaxRAM } from "../../../utilities/GenUtils";

export default new CommandExecutor()
	.setName("test")
	.setDescription("Testing")
	.setBasePermission({
		Level: PermissionLevel.Developer,
	})
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setExecutor(async (interaction) => {
		interaction.reply(`\`${getUsedRAM()}\` / \`${getMaxRAM()}\``);
	});