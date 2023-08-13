import { Message, PermissionFlagsBits } from "discord.js";
import { client } from "../../../Main";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import { errorEmbed, handleError, incrimentCase } from "../../../utilities/Utils";
import Case from "../../../schemas/Case";

export default new CommandExecutor()
	.setName("unban")
	.setDescription("Remove a ban from a user.")
	.addUserOption(opt =>
		opt.setName("user")
			.setDescription("Select the user you would like to unban.")
			.setRequired(true)
	)
	.addStringOption(opt =>
		opt.setName("reason")
			.setDescription("Enter the reason for the unban.")
			.setRequired(true)
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	.setBasePermission({
		Level: PermissionLevel.JuniorModerator,
	})
	.setExecutor(async (interaction) => {
		if (!interaction.inCachedGuild()) { interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true }); return; }

		const user = interaction.options.getUser("user")
		const reason = interaction.options.getString("reason")
		if (!user || !reason) return;

		if (!(await interaction.guild.bans.fetch()).get(user.id)) {
			interaction.reply({ embeds: [errorEmbed("This user is not banned!")], ephemeral: true })
			return;
		}

	});
