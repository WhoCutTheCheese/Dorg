import { Message, PermissionFlagsBits } from "discord.js";
import { client } from "../../../Main";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";

export default new CommandExecutor()
	.setName("wipecases")
	.setDescription("Wipe all cases. DO NOT USE THIS ON PRODUCTION.")
	.setBasePermission({
		Level: PermissionLevel.Developer,
	})
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setExecutor(async (interaction) => {
		const resultMessage: Message = await interaction.reply({ content: "🔃 Calculating...", fetchReply: true });
		const ping = resultMessage.createdTimestamp - interaction.createdTimestamp;
		interaction.editReply({ content: `<:check:1069088768830738554> Bot Latency: **${ping}ms**, API Latency: **${client.ws.ping}ms**` });
	});
