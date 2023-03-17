import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import { Log } from "../../../utilities/Logging";
const ms = require("ms");


export default new CommandExecutor()
	.setName("config")
	.setDescription("Setup Dorg.")
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setBasePermission({
		Level: PermissionLevel.Developer,
		HasRole: ["1085378823350141019"]
	})
	.setExecutor(async (interaction) => {
		if (!interaction.inCachedGuild()) { interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true }); return; }

		await interaction.deferReply();

		const subCommand = interaction.options.getSubcommand();
		const option = interaction.options.getString("option");
		if (!option) { interaction.reply({ content: "Somehow your inputted option was invalid?!", ephemeral: true }); }

		switch (subCommand) {

		}


	})
	.addSubcommand(subCommand =>
		subCommand
			.setName("channels")
			.setDescription("Configure the channels.")
			.addStringOption(opt =>
				opt
					.setName("option")
					.setDescription("Choose which channel config you'd like to change.")
					.setRequired(true)
					.addChoices(
						{ name: "Mod Logging", value: "modlogs" },
						{ name: "Suggestions Channel", value: "suggestions" },
					)
			)
			.addChannelOption(opt =>
				opt
					.setName("channel")
					.setDescription("Enter a channel to add to the configuration.")
					.setRequired(false)
			)
	)
	.addSubcommand(subCommand =>
		subCommand
			.setName("roles")
			.setDescription("Configure roles.")
			.addStringOption(opt =>
				opt
					.setName("option")
					.setDescription("Choose which roles you'd like to configure.")
					.setRequired(true)
					.addChoices(
						{ name: "Junior Moderator", value: "jrmod" },
						{ name: "Moderator", value: "mod" },
						{ name: "Assistant Admin", value: "assadmin" },
						{ name: "Administrator", value: "admin" },
						{ name: "Media Banned", value: "mediaban" },
						{ name: "Help Banned", value: "helpban" },
					)

			)
			.addRoleOption(opt =>
				opt
					.setName("role")
					.setDescription("Enter a role to add to the configuration.")
					.setRequired(false)
			)


	)

