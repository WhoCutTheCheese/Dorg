import { EmbedBuilder, PermissionFlagsBits } from "discord.js";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import { errorEmbed, getLengthFromString, handleError, incrimentCase, sendModLogs } from "../../../utilities/GenUtils";
import Case from "../../../schemas/Case";
import Bans from "../../../schemas/Bans";
import { config } from "../../../utilities/Config";

export default new CommandExecutor()
	.setName("ban")
	.setDescription("Ban a user from the server.")
	.addUserOption(opt =>
		opt.setName("user")
			.setDescription("Select the user you would like to ban.")
			.setRequired(true)
	)
	.addStringOption(opt =>
		opt.setName("reason")
			.setDescription("Enter the reason for the ban.")
			.setRequired(true)
	)
	.addStringOption(opt =>
		opt.setName("length")
			.setDescription("Enter the length for the ban. (Ex. 1h, 7d)")
			.setRequired(false)
	)
	.setBasePermission({
		Level: PermissionLevel.Moderator,
	})
	.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
	.setExecutor(async (interaction) => {
		if (!interaction.inCachedGuild()) { interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true }); return; }

		const user = interaction.options.getUser("user");
		const member = interaction.options.getMember("user");
		const reason = interaction.options.getString("reason");
		if (!user || !reason) return;
		let length = getLengthFromString(interaction.options.getString("length") || "");
		let lengthNum = (Math.floor(Date.now() / 1000) + length[0]!) || 0;
		if (!length[1]) {
			length[1] = "Permanent";
			lengthNum = 0;
		}


		if (member) {
			if (interaction.guild.ownerId == member.id || interaction.guild.members.me?.roles.highest.position! <= member.roles.highest.position) {
				interaction.reply(errorEmbed("I am unable to issue a ban to this user."));
				return;
			}
			if (interaction.member.roles.highest.position <= member.roles.highest.position || interaction.user.id == member.id) {
				interaction.reply(errorEmbed("You are unable to issue a ban to this user."));
				return;
			}
		}

		const caseNumber = await incrimentCase(interaction.guild);

		const newCase = new Case({
			guildID: interaction.guild.id,
			userID: user.id,
			modID: interaction.user.id,
			caseNumber: caseNumber,
			caseType: "BAN",
			reason: reason,
			duration: length[1],
			durationUnix: lengthNum,
			active: true,
			dateIssued: Date.now()
		});
		newCase.save().catch((err: Error) => {
			handleError(err);
		});

		if (length[0] !== null) {
			const newBans = new Bans({
				guildID: interaction.guild.id,
				userID: user.id,
				caseNumber: caseNumber,
				endDate: lengthNum
			});
			newBans.save().catch((err: Error) => {
				handleError(err);
			});
		} else {
			await Bans.deleteMany({
				guildID: interaction.guild.id,
				userID: user.id
			});
		}

		const warns = await Case.count({
			guildID: interaction.guild.id,
			userID: user.id,
			caseType: "WARN",
			active: true,
		});

		const banEmbed = new EmbedBuilder()
			.setDescription(`**Case:** #${caseNumber} | **Mod:** ${interaction.user.username} | **Reason:** ${reason} | **Duration:** ${length[1]}`)
			.setColor("Blurple");
		interaction.reply({ content: `${config.arrowEmoji} **${user.username}** has been banned. (**${warns}** warns)`, embeds: [banEmbed] });

		const youAreBanned = new EmbedBuilder()
			.setAuthor({ name: `You have been banned from ${interaction.guild.name}`, iconURL: interaction.guild.iconURL() || undefined })
			.setDescription(`${config.bulletpointEmoji} **Reason:** ${reason}
			${config.bulletpointEmoji} **Duration:** ${length[1]}
			${config.bulletpointEmoji} **Case Number:** #${caseNumber}
			
			If you believe this is a mistake, or unjustified, you may fill out an appeal at https://discord.gg/FjMjd4GrdB.`)
			.setColor("Blurple")
			.setTimestamp();
		await user.send({ embeds: [youAreBanned] }).catch((err: Error) => { console.log("Uh oh!\n" + err.stack); });

		await interaction.guild.bans.create(user, { reason: `Mod: ${interaction.user.username}\nReason: ${reason}` });

		await sendModLogs({ guild: interaction.guild!, mod: interaction.member!, targetUser: user, action: "Ban" }, { title: "User Banned", actionInfo: `**Reason:** ${reason}\n> **Duration:** ${length[1]}\n> **Case ID:** ${caseNumber}`, channel: interaction.channel || undefined });
	});