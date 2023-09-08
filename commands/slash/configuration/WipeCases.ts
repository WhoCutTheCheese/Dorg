import { APIButtonComponent, ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, Embed, EmbedBuilder, Message, PermissionFlagsBits } from "discord.js";
import { client } from "../../../Main";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import Settings from "../../../schemas/Settings";
import Case from "../../../schemas/Case";

export default new CommandExecutor()
	.setName("wipecases")
	.setDescription("Wipe all cases. DO NOT USE THIS ON PRODUCTION.")
	.setBasePermission({
		Level: PermissionLevel.Developer,
	})
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setExecutor(async (interaction) => {
		if (!interaction.inCachedGuild()) { interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true }); return; }

		let row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setStyle(ButtonStyle.Danger)
					.setCustomId("CONFIRM")
					.setLabel("Confirm")
					.setEmoji("🛑")
			);



		const areYouSureEmbed = new EmbedBuilder()
			.setTitle("Warning!")
			.setColor("Blurple")
			.setDescription(`You are about to delete all case files, are you sure you want to do that?`)
			.setTimestamp();
		const buttonMessage = await interaction.reply({ embeds: [areYouSureEmbed], components: [row], fetchReply: true });

		const collector = buttonMessage.createMessageComponentCollector({ time: 15000 });

		collector.on('collect', async (buttonInteraction: ButtonInteraction) => {
			if (buttonInteraction.user.id !== interaction.user.id) {
				buttonInteraction.reply({ content: "This is not your button!", ephemeral: true });
				return;
			}
			await buttonInteraction.deferUpdate();
			if (buttonInteraction.customId == "CONFIRM") {
				if (buttonInteraction.user.id === interaction.user.id) {
					row = new ActionRowBuilder<ButtonBuilder>()
						.addComponents(
							ButtonBuilder.from(buttonMessage.components[0].components[0] as APIButtonComponent).setDisabled(true)
						);

					const doneEmbed = new EmbedBuilder()
						.setTitle("Success")
						.setColor("Blurple")
						.setDescription(`All case files have been deleted.`)
						.setTimestamp();

					await interaction.editReply({ embeds: [doneEmbed], components: [row] });
					await Settings.findOneAndUpdate({
						guildID: interaction.guild?.id
					}, {
						caseCount: 1
					});
					await Case.deleteMany({
						guildID: interaction.guild?.id
					});
				}
			}
		});
	});
