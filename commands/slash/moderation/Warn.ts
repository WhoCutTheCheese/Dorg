import { EmbedBuilder, Message, PermissionFlagsBits } from "discord.js";
import { client } from "../../../Main";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import { errorEmbed, getLengthFromString, handleError, incrimentCase, sendModLogs } from "../../../utilities/Utils";
import Case from "../../../schemas/Case";
import { config } from "../../../utilities/Config";

export default new CommandExecutor()
	.setName("warn")
	.setDescription("Issue a warning to a user.")
	.addUserOption(opt =>
		opt.setName("user")
			.setDescription("Select the user you would like to warn.")
			.setRequired(true)
	)
	.addStringOption(opt =>
		opt.setName("reason")
			.setDescription("Enter the reason for the warn.")
			.setRequired(true)
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
	.setBasePermission({
		Level: PermissionLevel.JuniorModerator,
	})
	.setExecutor(async (interaction) => {
		if (!interaction.inCachedGuild()) { interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true }); return; }

		await interaction.deferReply();

		const user = interaction.options.getUser("user");
		const member = interaction.options.getMember("user");
		const reason = interaction.options.getString("reason");
		if (!user || !reason) return;

		if (!member) {
			interaction.editReply({ embeds: [errorEmbed("This user is not in the server!")] });
			return;
		}

		if (interaction.member.roles.highest.position <= member.roles.highest.position || interaction.user.id == member.id) {
			interaction.editReply({ embeds: [errorEmbed("You are unable to issue a warning to this user.")] });
			return;
		}

		const expiresAt = getLengthFromString("30d");

		const caseNumber = await incrimentCase(interaction.guild);

		const newCase = new Case({
			guildID: interaction.guild.id,
			userID: user.id,
			modID: interaction.user.id,
			caseNumber: caseNumber,
			caseType: "WARN",
			reason: reason,
			duration: expiresAt[1],
			durationUnix: (Math.floor(Date.now() / 1000) + expiresAt[0]!),
			active: true,
			dateIssued: Date.now()
		});
		newCase.save().catch((err: Error) => {
			handleError(err);
		});

		const warns = await Case.count({
			guildID: interaction.guild.id,
			userID: user.id,
			caseType: "WARN",
			active: true,
		});

		const warnEmbed = new EmbedBuilder()
			.setDescription(`**Case:** #${caseNumber} | **Mod:** ${interaction.user.username} | **Reason:** ${reason}`)
			.setColor("Blurple");
		interaction.editReply({ content: `${config.arrowEmoji} **${user.username}** has been warned. (**${warns}** warns)`, embeds: [warnEmbed] });

		const warnedDM = new EmbedBuilder()
			.setAuthor({ name: `You have been warned`, iconURL: interaction.guild.iconURL() || undefined })
			.setDescription(`${config.bulletpointEmoji} **Reason:** ${reason}
			${config.bulletpointEmoji} **Case Number:** #${caseNumber}
			
			Continued warns will result in more severe punishment. Keep in mind, warnings will expire in 30 days, meaning it will not longer effect moderation decisions, applications, and more.`)
			.setColor("Blurple")
			.setTimestamp();
		await user.send({ embeds: [warnedDM] }).catch((err: Error) => { });

		await sendModLogs({ guild: interaction.guild!, mod: interaction.member!, targetUser: user, action: "Warning" }, { title: "User Warned", actionInfo: `**Reason:** ${reason}\n> **Case ID:** ${caseNumber}`, channel: interaction.channel || undefined });


	});
