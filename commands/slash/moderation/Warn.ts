import { Message, PermissionFlagsBits } from "discord.js";
import { client } from "../../../Main";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import { errorEmbed, handleError, incrimentCase } from "../../../utilities/Utils";
import Case from "../../../schemas/Case";

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

		const user = interaction.options.getUser("user")
		const member = interaction.options.getMember("user")
		const reason = interaction.options.getString("reason")
		if (!user || !reason) return;

		if (!member) {
			interaction.reply({ embeds: [errorEmbed("This user is not in the server!")], ephemeral: true })
			return;
		}

		if (interaction.member.roles.highest.position <= member.roles.highest.position || interaction.user.id == member.id) {
			interaction.reply({ embeds: [errorEmbed("You are unable to issue a warning to this user.")], ephemeral: true })
			return;
		}

		const caseNumber = await incrimentCase(interaction.guild);

		const newCase = new Case({
			guildID: interaction.guild.id,
			userID: user.id,
			modID: interaction.user.id,
			caseNumber: caseNumber,
			caseType: "BAN",
			reason: reason,
			duration: "30 Day(s)",
			dateIssued: Date.now()
		})
		newCase.save().catch((err: Error) => {
			handleError(err);
		})

	});
