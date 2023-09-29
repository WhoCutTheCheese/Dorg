import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import { errorEmbed, incrimentSuggestion } from "../../../utilities/Utils";
import Suggestion from "../../../schemas/Suggestion";
import { EmbedType, MessageResponse } from "../../../classes/MessageResponse";
import { BaseMessageOptions, Role, TextChannel } from "discord.js";
import { config } from "../../../utilities/Config";

export default new CommandExecutor()
	.setName("suggest")
	.setDescription("Suggest a feature for The Bot Den.")
	.addStringOption(opt =>
		opt
			.setName("suggestion")
			.setDescription("Enter what you would like to suggest.")
			.setRequired(true)
	)
	.addAttachmentOption(opt =>
		opt
			.setName("image")
			.setDescription("Enter an image for the suggestion.")
			.setRequired(false)
	)
	.setBasePermission({
		Level: PermissionLevel.None,
	})
	.setExecutor(async (interaction) => {
		if (!interaction.inCachedGuild()) { interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true }); return; }

		if (interaction.member.roles.cache.find((r: Role) => r.name.toLowerCase() === "suggestion banned")) {
			interaction.reply(errorEmbed("You are banned from using suggestion channels."));
			return;
		}
		const suggChannel = await interaction.guild.channels.fetch("1081103059091984444") as TextChannel;
		const suggestion = interaction.options.getString("suggestion");
		if (!suggestion) {
			interaction.reply(errorEmbed("Invalid suggestion."));
			return;
		}

		const image = interaction.options.getAttachment("image") || null;
		if (!suggChannel) {
			interaction.reply(errorEmbed("Invalid suggestions channel! Please contact an admin."));
			return;
		}
		const openSuggestions = await Suggestion.count({
			guildID: interaction.guild.id,
			creatorID: interaction.user.id
		});
		if (openSuggestions >= 3) {
			interaction.reply(errorEmbed("Uh oh! You have too many suggestions open."));
			return;
		}

		const suggestionNumber = await incrimentSuggestion(interaction.guild);

		const reply = new MessageResponse()
			.addEmbeds([
				{
					type: EmbedType.Normal,
					author: { name: `Suggestion #${suggestionNumber}`, iconURL: interaction.user.displayAvatarURL() || undefined },
					description: suggestion,
					footer: { text: `Posted by: ${interaction.user.username}`, timestamp: true },
					image: image?.url,
				}
			])
			.build() as BaseMessageOptions;
		const message = await suggChannel.send(reply);
		message.react("👍");
		message.react("🟨");
		message.react("👎");
		message.startThread({
			name: `Suggestion #${suggestionNumber}`,
			autoArchiveDuration: 60,
			reason: `${suggestion}`,
		});

		const success = new MessageResponse()
			.addEmbeds([
				{
					type: EmbedType.Success,
					description: `${config.successEmoji} Your suggestion has been sent! ${message.url}`
				}
			])
			.setEphemeral(true)
			.build();
		interaction.reply(success);


		const newSugg = new Suggestion({
			guildID: interaction.guild.id,
			creatorID: interaction.user.id,
			suggestionID: suggestionNumber,
			messageID: message.id,
			channelID: suggChannel.id,
			suggestionsText: suggestion,
			imageURL: image?.url,
		});
		newSugg.save().catch();
	});