import { PermissionFlagsBits } from "discord.js";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";

export default new CommandExecutor()
	.setName("suggestions")
	.setDescription("Manage suggestions.")
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	.setBasePermission({
		Level: PermissionLevel.Administrator,
	})
	.setExecutor(async (interaction) => {
		if (!interaction.inCachedGuild()) { interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true }); return; }



	})
	.addSubcommand(subCommand =>
		subCommand
			.setName("approve")
			.setDescription("Approve a suggestion.")
			.addStringOption(opt =>
				opt
					.setName("suggestion")
					.setDescription("Enter the suggestion you'd like to approve.")
					.setRequired(true)
			)
			.addStringOption(opt =>
				opt
					.setName("reason")
					.setDescription("Enter the reason for approving this suggestion.")
					.setRequired(true)
			)
	)
	.addSubcommand(subCommand =>
		subCommand
			.setName("deny")
			.setDescription("Deny a suggestion.")
			.addStringOption(opt =>
				opt
					.setName("suggestion")
					.setDescription("Enter the suggestion you'd like to deny.")
					.setRequired(true)
			)
			.addStringOption(opt =>
				opt
					.setName("reason")
					.setDescription("Enter the reason for denying this suggestion.")
					.setRequired(true)
			)
	);
