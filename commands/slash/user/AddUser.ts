import { Message } from "discord.js";
import { client } from "../../../Main";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";

export default new CommandExecutor()
	.setName("adduser")
	.setDescription("Add a user to a ticket.")
	.addUserOption(opt =>
		opt
			.setName("user")
			.setDescription("Enter the user you would like to add.")
			.setRequired(true)
	)
	.setBasePermission({
		Level: PermissionLevel.None,
	})
	.setExecutor(async (interaction) => {
		interaction.reply({ content: "In the works." });
	});
