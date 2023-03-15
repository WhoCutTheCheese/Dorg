import { EmbedBuilder, Message } from "discord.js";
import { client } from "../../../Main";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";

export default new CommandExecutor()
	.setName("avatar")
	.setDescription("Get a user's enlarged avatar.")
	.addUserOption(option =>
		option
			.setName("user")
			.setDescription("Get any user's avatar!")
			.setRequired(false)
	)
	.setBasePermission({
		Level: PermissionLevel.None,
	})
	.setExecutor(async (interaction) => {
		if (!interaction.inCachedGuild()) { interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true }); return; }

		let user = interaction.options.getUser("user");
		if (!user) {
			user = interaction.user;
		}

		let avatarEmbed = new EmbedBuilder()
			.setAuthor({ name: `${user.tag}'s Avatar`, iconURL: user.displayAvatarURL() || undefined })
			.setColor("Random")
			.setImage(user.displayAvatarURL({ size: 512 }) || null)
			.setFooter({ text: `Requested by ${interaction.user.tag}`, iconURL: interaction.user.displayAvatarURL() || undefined });
		interaction.reply({ embeds: [avatarEmbed] });
	});
