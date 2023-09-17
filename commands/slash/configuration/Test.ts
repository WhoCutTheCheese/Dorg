import { ActionRowBuilder, BaseMessageOptions, ButtonBuilder, ButtonStyle, EmbedBuilder, Message, PermissionFlagsBits } from "discord.js";
import { client } from "../../../Main";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import { EmbedType, MessageResponse } from "../../../classes/MessageResponse";

export default new CommandExecutor()
	.setName("test")
	.setDescription("Testing")
	.setBasePermission({
		Level: PermissionLevel.Developer,
	})
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setExecutor(async (interaction) => {
		const embed = new EmbedBuilder()
			.setAuthor({ name: "Join The Bot Den!", iconURL: "https://media.discordapp.net/attachments/1085400093122895883/1153051209201094746/2b6ec374e9b3129db5c3f1a82d687247_1.webp" })
			.setColor("Blurple")
			.setDescription(`The Bot Den is a community for developers of any kind. We are a safe space for new and experienced developers to flourish. Share your creations, talk with likeminded people or just chill out! <a:disco_cat:1139702369169453116>
			> \`🎉\` **NITRO** Giveaways at major member milestones`);
		const row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setLabel("Join Now!")
					.setStyle(ButtonStyle.Link)
					.setURL("https://discord.gg/ASM9Fs3VVg")
					.setEmoji("🌌")
			);
		interaction.reply({ embeds: [embed], components: [row] });
	});
