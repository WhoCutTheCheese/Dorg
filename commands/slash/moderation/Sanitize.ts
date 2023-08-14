import { EmbedBuilder, Message, PermissionFlagsBits } from "discord.js";
import { client } from "../../../Main";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import { errorEmbed, getLengthFromString, handleError, incrimentCase, sendModLogs } from "../../../utilities/Utils";
import Case from "../../../schemas/Case";
import { config } from "../../../utilities/Config";
import { weirdToNormalChars } from "weird-to-normal-chars";

export default new CommandExecutor()
	.setName("sanitize")
	.setDescription("Sanitize and dehoist a user.")
	.addUserOption(opt =>
		opt.setName("user")
			.setDescription("Select the user you would like to sanitize.")
			.setRequired(true)
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	.setBasePermission({
		Level: PermissionLevel.JuniorModerator,
	})
	.setExecutor(async (interaction) => {
		if (!interaction.inCachedGuild()) { interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true }); return; }

		await interaction.deferReply({ ephemeral: true });

		const user = interaction.options.getUser("user");
		const member = interaction.options.getMember("user");
		if (!member) {
			interaction.editReply({ embeds: [errorEmbed("This user is not in the guild!")] });
			return;
		}
		if (!user) return;

		if (interaction.guild?.ownerId === user.id || member.roles.highest.position >= interaction.guild.members.me?.roles.highest.position!) {
			interaction.editReply({ embeds: [errorEmbed("I am unable to edit this user's nickname!")] });
			return;
		}

		const before = user.globalName || "";
		let after = user.globalName || "";

		after = weirdToNormalChars(after);
		if (after.startsWith("!")) {
			after = after.substring(1);
		}

		member.setNickname(after, `Mod: ${interaction.user.username}`).catch(async (err: Error) => {
			handleError(err);
			interaction.editReply({ embeds: [errorEmbed(`An unknown error occurred!`)] });
			return;
		}).then(async () => {

			const unbannedEmbed = new EmbedBuilder()
				.setDescription(`**Mod:** ${interaction.user.username}`)
				.setColor("Blurple");
			await interaction.editReply({ embeds: [unbannedEmbed], content: `${config.arrowEmoji} **${user.username}** has been sanitized.` });

			if (after.startsWith(" ")) after = after.substring(1);

			sendModLogs(
				{
					guild: interaction.guild,
					mod: interaction.member!,
					target: member,
					action: "Username Sanitized",
				},
				{ title: "Username Sanitized", actionInfo: `\`${before}\` -> \`${after}\`` }
			);
		});

	});
