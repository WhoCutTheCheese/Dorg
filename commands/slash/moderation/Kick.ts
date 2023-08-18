import { EmbedBuilder, Message, PermissionFlagsBits } from "discord.js";
import { client } from "../../../Main";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import { errorEmbed, getLengthFromString, handleError, incrimentCase, sendModLogs } from "../../../utilities/Utils";
import Case from "../../../schemas/Case";
import { config } from "../../../utilities/Config";

export default new CommandExecutor()
	.setName("kick")
	.setDescription("Kick a user from the server.")
	.addUserOption(opt =>
		opt.setName("user")
			.setDescription("Select the user you would like to kick.")
			.setRequired(true)
	)
	.addStringOption(opt =>
		opt.setName("reason")
			.setDescription("Enter the reason for the kick.")
			.setRequired(true)
	)
	.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers)
	.setBasePermission({
		Level: PermissionLevel.JuniorModerator,
	})
	.setExecutor(async (interaction) => {
		if (!interaction.inCachedGuild()) { interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true }); return; }

		const user = interaction.options.getUser("user");
		const member = interaction.options.getMember("user");
		const reason = interaction.options.getString("reason");
		if (!user || !member || !reason) return;

		if (!member) {
			interaction.reply(errorEmbed("This user is not in the server!"));
			return;
		}

		if (interaction.member.roles.highest.position <= member.roles.highest.position || interaction.user.id == member.id) {
			interaction.reply(errorEmbed("You are unable to issue a kick to this user."));
			return;
		}

		member.kick(`Mod: ${interaction.user.username}\nReason: ${reason}`).then(async () => {
			const caseNumber = await incrimentCase(interaction.guild);

			const newCase = new Case({
				guildID: interaction.guild.id,
				userID: user.id,
				modID: interaction.user.id,
				caseNumber: caseNumber,
				caseType: "KICK",
				reason: reason,
				duration: "None",
				durationUnix: null,
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

			const kickEmbed = new EmbedBuilder()
				.setDescription(`**Case:** #${caseNumber} | **Mod:** ${interaction.user.username} | **Reason:** ${reason}`)
				.setColor("Blurple");
			interaction.reply({ content: `${config.arrowEmoji} **${user.username}** has been kicked. (**${warns}** warns)`, embeds: [kickEmbed] });

			const kickedSuccess = new EmbedBuilder()
				.setAuthor({ name: `You have been kicked from ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() || undefined })
				.setDescription(`${config.bulletpointEmoji} **Reason:** ${reason}
				${config.bulletpointEmoji} **Case Number:** #${caseNumber}
				
				You may rejoin, but comply with the reason before.
				https://discord.gg/ASM9Fs3VVg`)
				.setColor("Blurple")
				.setTimestamp();
			await user.send({ embeds: [kickedSuccess] }).catch((err: Error) => { });

			await sendModLogs({ guild: interaction.guild!, mod: interaction.member!, targetUser: user, action: "Kick" }, { title: "User Kicked", actionInfo: `**Reason:** ${reason}\n> **Case ID:** ${caseNumber}`, channel: interaction.channel || undefined });
		}).catch(async (err: Error) => {
			handleError(err);
			await interaction.reply(errorEmbed(`Something went wrong!\n\n\`${err.message}\``));
		});


	});
