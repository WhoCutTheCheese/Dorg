import { EmbedBuilder, Message, PermissionFlagsBits } from "discord.js";
import { client } from "../../../Main";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import { errorEmbed, handleError, incrimentCase, sendModLogs } from "../../../utilities/Utils";
import Case from "../../../schemas/Case";
import Bans from "../../../schemas/Bans";
import { config } from "../../../utilities/Config";

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
	.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers)
	.setBasePermission({
		Level: PermissionLevel.Moderator,
	})
	.setExecutor(async (interaction) => {
		if (!interaction.inCachedGuild()) { interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true }); return; }

		await interaction.deferReply();

		const user = interaction.options.getUser("user");
		const reason = interaction.options.getString("reason");
		if (!user || !reason) return;

		if (!(await interaction.guild.bans.fetch()).get(user.id)) {
			interaction.editReply({ embeds: [errorEmbed("This user is not banned!")] });
			return;
		}


		await interaction.guild.bans.remove(user.id, `Mod: ${interaction.user.username}\nReason: ${reason}`).then(async () => {
			const caseNumber = await incrimentCase(interaction.guild);
			const newCase = new Case({
				guildID: interaction.guild.id,
				userID: user.id,
				modID: interaction.user.id,
				caseNumber: caseNumber,
				caseType: "UNBAN",
				reason: reason,
				duration: "None",
				durationUnix: 0,
				active: null,
				dateIssued: Date.now()
			});
			newCase.save().catch((err: Error) => {
				handleError(err);
			});

			const firstBan = await Case.findOneAndUpdate({
				guildID: interaction.guild.id,
				userID: user.id,
				caseType: "BAN",
				active: true,
			}, {
				active: false
			});

			await Bans.deleteMany({
				guildID: interaction.guild.id,
				userID: user.id
			});

			const unbannedEmbed = new EmbedBuilder()
				.setDescription(`**Case:** #${caseNumber} | **Mod:** ${interaction.user.username} | **Reason:** ${reason}`)
				.setColor("Blurple");
			await interaction.editReply({ embeds: [unbannedEmbed], content: `${config.arrowEmoji} **${user.username}** has been unbanned.` });

			await sendModLogs({ guild: interaction.guild!, mod: interaction.member!, targetUser: user, action: "Unban" }, { title: "User Unbanned", actionInfo: `**Reason:** ${reason}\n> **Case ID:** ${caseNumber}`, channel: interaction.channel || undefined });
		}).catch(async (err: Error) => {
			handleError(err);
			await interaction.editReply({ embeds: [errorEmbed(`Something went wrong!\n\n\`${err.message}\``)] });
		});

	});
