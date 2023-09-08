import { Base, BaseMessageOptions, ButtonStyle, PermissionFlagsBits, Role, TextChannel } from "discord.js";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import Suggestion from "../../../schemas/Suggestion";
import { errorEmbed, getLengthFromString, handleError, incrimentCase, sendModLogs } from "../../../utilities/Utils";
import { EmbedType, MessageResponse } from "../../../classes/MessageResponse";
import { client } from "../../../Main";
import { config } from "../../../utilities/Config";
import RoleBans from "../../../schemas/RoleBans";
import Case from "../../../schemas/Case";

export default new CommandExecutor()
	.setName("suggestions")
	.setDescription("Manage suggestions.")
	.setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
	.setBasePermission({
		Level: PermissionLevel.Administrator,
	})
	.setExecutor(async (interaction) => {
		if (!interaction.inCachedGuild()) { interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true }); return; }

		const subCommand = interaction.options.getSubcommand();
		const suggestion = interaction.options.getString("suggestion");
		const reason = interaction.options.getString("reason");
		const user = interaction.options.getUser("user");
		const member = interaction.options.getMember("user");
		if (!subCommand) {
			interaction.reply(errorEmbed("No sub command found!"));
			return;
		};

		switch (subCommand) {

			case "approve":
				if (!suggestion || !reason) {
					interaction.reply(errorEmbed("err!"));
					return;
				};
				const foundSugg = await Suggestion.findOne({
					guildID: interaction.guild.id,
					suggestionID: suggestion,
				});
				if (!foundSugg) {
					interaction.reply(errorEmbed("Invalid suggestion!"));
					return;
				}
				const channel = await interaction.guild.channels.fetch(foundSugg.channelID!) as TextChannel;
				if (!channel) {
					interaction.reply(errorEmbed("Invalid suggestions channel!"));
					await foundSugg.deleteOne();
					return;
				}
				const message = await channel.messages.fetch(foundSugg.messageID!);
				if (!message) {
					interaction.reply(errorEmbed("No valid suggestion message found!"));
					await foundSugg.deleteOne();
					return;
				}
				const suggUser = await client.users.fetch(foundSugg.creatorID!);
				const suggMember = await interaction.guild.members.fetch(suggUser.id);
				if (!suggUser) {
					interaction.reply(errorEmbed("No valid suggestion user found!"));
					await foundSugg.deleteOne();
					return;
				}
				const response = new MessageResponse()
					.addEmbeds([
						{
							type: EmbedType.Success,
							author: { name: `Suggestion #${foundSugg.suggestionID} (Approved)`, iconURL: suggUser.displayAvatarURL() || undefined },
							description: foundSugg.suggestionsText,
							fields: [
								{ name: `${interaction.user.username} Response:`, value: `${reason}` }
							],
							footer: { text: `Posted by: ${suggUser.username}`, timestamp: true },
							image: foundSugg.imageURL,
						}
					]).build() as BaseMessageOptions;
				await message.edit(response);
				await message.reactions.removeAll();

				if (suggMember) {
					const DM = new MessageResponse()
						.addEmbeds([
							{
								type: EmbedType.Success,
								author: { name: `Suggestion #${foundSugg.suggestionID} Approved`, iconURL: interaction.guild.iconURL() || undefined },
								description: `Your suggestion: ${message.url}`,
								fields: [
									{ name: `${interaction.user.username} Response:`, value: `${reason}` }
								],
								footer: { timestamp: true }
							}
						]).build() as BaseMessageOptions;
					await suggMember.send(DM).catch(async (err: Error) => {
						handleError(err);
					});
				}

				const success = new MessageResponse()
					.addEmbeds([
						{
							type: EmbedType.Success,
							description: `${config.successEmoji} You have approved suggestion **#${foundSugg.suggestionID}** (${message.url})`
						}
					])
					.setEphemeral(true)
					.build();
				interaction.reply(success);
				await foundSugg.deleteOne();
				break;
			case "deny":
				if (!suggestion || !reason) {
					interaction.reply(errorEmbed("err!"));
					return;
				};
				const foundSuggDeny = await Suggestion.findOne({
					guildID: interaction.guild.id,
					suggestionID: suggestion,
				});
				if (!foundSuggDeny) {
					interaction.reply(errorEmbed("Invalid suggestion!"));
					return;
				}
				const channelDeny = await interaction.guild.channels.fetch(foundSuggDeny.channelID!) as TextChannel;
				if (!channelDeny) {
					interaction.reply(errorEmbed("Invalid suggestions channel!"));
					await foundSuggDeny.deleteOne();
					return;
				}
				const messageDeny = await channelDeny.messages.fetch(foundSuggDeny.messageID!);
				if (!messageDeny) {
					interaction.reply(errorEmbed("No valid suggestion message found!"));
					await foundSuggDeny.deleteOne();
					return;
				}
				const suggUserDeny = await client.users.fetch(foundSuggDeny.creatorID!);
				const suggMemberDeny = await interaction.guild.members.fetch(suggUserDeny.id);
				if (!suggUserDeny) {
					interaction.reply(errorEmbed("No valid suggestion user found!"));
					await foundSuggDeny.deleteOne();
					return;
				}
				const responseDeny = new MessageResponse()
					.addEmbeds([
						{
							type: EmbedType.Error,
							author: { name: `Suggestion #${foundSuggDeny.suggestionID} (Denied)`, iconURL: suggUserDeny.displayAvatarURL() || undefined },
							description: foundSuggDeny.suggestionsText,
							fields: [
								{ name: `${interaction.user.username} Response:`, value: `${reason}` }
							],
							footer: { text: `Posted by: ${suggUserDeny.username}`, timestamp: true },
							image: foundSuggDeny.imageURL,
						}
					]).build() as BaseMessageOptions;
				await messageDeny.edit(responseDeny);
				await messageDeny.reactions.removeAll();

				if (suggMemberDeny) {
					const DM = new MessageResponse()
						.addEmbeds([
							{
								type: EmbedType.Error,
								author: { name: `Suggestion #${foundSuggDeny.suggestionID} Denied`, iconURL: interaction.guild.iconURL() || undefined },
								description: `Your suggestion: ${messageDeny.url}`,
								fields: [
									{ name: `${interaction.user.username} Response:`, value: `${reason}` }
								],
								footer: { timestamp: true }
							}
						]).build() as BaseMessageOptions;
					await suggMemberDeny.send(DM).catch(async (err: Error) => {
						handleError(err);
					});
				}

				const successDeny = new MessageResponse()
					.addEmbeds([
						{
							type: EmbedType.Success,
							description: `${config.successEmoji} You have denied suggestion **#${foundSuggDeny.suggestionID}** (${messageDeny.url})`
						}
					])
					.setEphemeral(true)
					.build();
				interaction.reply(successDeny);
				await foundSuggDeny.deleteOne();
				break;
			case "delete":
				if (!suggestion) {
					interaction.reply(errorEmbed("err!"));
					return;
				};
				const foundSuggDelete = await Suggestion.findOne({
					guildID: interaction.guild.id,
					suggestionID: suggestion,
				});
				if (!foundSuggDelete) {
					interaction.reply(errorEmbed("Invalid suggestion!"));
					return;
				}
				const channelDelete = await interaction.guild.channels.fetch(foundSuggDelete.channelID!) as TextChannel;
				if (!channelDelete) {
					interaction.reply(errorEmbed("Invalid suggestions channel!"));
					await foundSuggDelete.deleteOne();
					return;
				}
				const messageDelete = await channelDelete.messages.fetch(foundSuggDelete.messageID!);
				if (!messageDelete) {
					interaction.reply(errorEmbed("No valid suggestion message found!"));
					await foundSuggDelete.deleteOne();
					return;
				}
				if (!messageDelete.deletable) {
					interaction.reply(errorEmbed("I could not delete that suggestion!"));
					return;
				}
				await messageDelete.delete().catch(async () => {
					interaction.reply(errorEmbed("I could not delete that suggestion!"));
				}).then(async () => {
					const response = new MessageResponse()
						.addEmbeds([
							{
								type: EmbedType.Success,
								description: `${config.successEmoji} Successfully deleted that suggestion!`
							}
						])
						.setEphemeral(true)
						.build();
					interaction.reply(response);
					await foundSuggDelete.deleteOne();
				});
				break;
			case "ban":
				if (!reason || !user || !member) {
					interaction.reply(errorEmbed("No valid member found!"));
					return;
				}
				const findBan = await RoleBans.findOne({
					guildID: interaction.guild.id,
					userID: user.id,
					type: "SUGGESTION"
				});
				if (findBan) {
					interaction.reply(errorEmbed("This user is already banned!"));
					return;
				}

				let length = getLengthFromString(interaction.options.getString("length") || "");
				let lengthNum = (Math.floor(Date.now() / 1000) + length[0]!) || 0;
				if (!length[1]) {
					length[1] = "Permanent";
					lengthNum = 0;
				}

				const caseNumber = await incrimentCase(interaction.guild);

				const newCase = new Case({
					guildID: interaction.guild.id,
					userID: user.id,
					modID: interaction.user.id,
					caseNumber: caseNumber,
					caseType: "SUGGESTION BAN",
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
					const role = interaction.guild.roles.cache.find((r: Role) => r.name.toLowerCase() === "suggestion banned");
					if (!role) return;
					const newRoleBan = new RoleBans({
						guildID: interaction.guild.id,
						userID: user.id,
						roleID: role.id,
						caseNumber: caseNumber,
						type: "SUGGESTION",
						endDate: lengthNum
					});
					newRoleBan.save().catch(() => { });
				} else {
					await RoleBans.deleteMany({
						guildID: interaction.guild.id,
						userID: user.id,
						type: "SUGGESTION",
					});
					const role = interaction.guild.roles.cache.find((r: Role) => r.name.toLowerCase() === "suggestion banned");
					if (!role) return;
					const newRoleBan = new RoleBans({
						guildID: interaction.guild.id,
						userID: user.id,
						roleID: role.id,
						caseNumber: caseNumber,
						type: "SUGGESTION",
						endDate: 0
					});
					newRoleBan.save().catch(() => { });
				}

				const warns = await Case.count({
					guildID: interaction.guild.id,
					userID: user.id,
					caseType: "WARN",
					active: true,
				});

				const userBanned = new MessageResponse()
					.addEmbeds([
						{
							type: EmbedType.Normal,
							description: `**Case:** #${caseNumber} | **Mod:** ${interaction.user.username} | **Reason:** ${reason} | **Duration:** ${length[1]}`
						}
					])
					.setContent(`${config.arrowEmoji} **${user.username}** has been banned from suggesting. (**${warns}** warns)`)
					.build();
				interaction.reply(userBanned);

				const youAreBanned = new MessageResponse()
					.addEmbeds([
						{
							type: EmbedType.Normal,
							author: { name: `You have been suggestion banned`, iconURL: interaction.guild.iconURL() || undefined },
							description: `${config.bulletpointEmoji} **Reason:** ${reason}
							${config.bulletpointEmoji} **Duration:** ${length[1]}
							${config.bulletpointEmoji} **Case Number:** #${caseNumber}
							
							If you believe this is a mistake, or unjustified, you may appeal in tickets.`,
							footer: { timestamp: true }
						}
					])
					.addButtons([
						{
							label: "Open a Ticket",
							emoji: "🎫",
							style: ButtonStyle.Link,
							url: "https://discord.com/channels/1079964060872880229/1081102152577064971"
						}
					])
					.build() as BaseMessageOptions;
				user.send(youAreBanned).catch(() => { });
				const role = interaction.guild.roles.cache.find((r: Role) => r.name.toLowerCase() === "suggestion banned");
				if (!role) return;
				member.roles.add(role).catch((err: Error) => {
					handleError(err);
				});

				await sendModLogs({ guild: interaction.guild!, mod: interaction.member!, targetUser: user, action: "Suggestion Ban" }, { title: "User Suggestion Banned", actionInfo: `**Reason:** ${reason}\n> **Duration:** ${length[1]}\n> **Case ID:** ${caseNumber}`, channel: interaction.channel || undefined });
				break;
			case "unban":
				if (!reason || !user) {
					interaction.reply(errorEmbed("No valid user found!"));
					return;
				}
				const isBan = await RoleBans.findOne({
					guildID: interaction.guild.id,
					userID: user.id,
					type: "SUGGESTION"
				});

				const ubWarns = await Case.count({
					guildID: interaction.guild.id,
					userID: user.id,
					caseType: "WARN",
					active: true,
				});

				if (!isBan) {
					if (!member) {
						interaction.reply(errorEmbed("This user is not banned."));
						return;
					}
					if (!member.guild.roles.cache.find((r: Role) => r.name.toLowerCase() === "suggestion banned")) {
						interaction.reply(errorEmbed("This user is not banned."));
						return;
					}
					const caseNumber = await incrimentCase(interaction.guild);

					const newCase = new Case({
						guildID: interaction.guild.id,
						userID: user.id,
						modID: interaction.user.id,
						caseNumber: caseNumber,
						caseType: "SUGGESTION UNBAN",
						reason: reason,
						duration: "None",
						durationUnix: 0,
						active: null,
						dateIssued: Date.now()
					});
					newCase.save().catch((err: Error) => {
						handleError(err);
					});

					const userUnbanned = new MessageResponse()
						.addEmbeds([
							{
								type: EmbedType.Normal,
								description: `**Case:** #${caseNumber} | **Mod:** ${interaction.user.username} | **Reason:** ${reason}`
							}
						])
						.setContent(`${config.arrowEmoji} **${user.username}** has been unbanned from suggesting. (**${ubWarns}** warns)`)
						.build();
					interaction.reply(userUnbanned);

					const role = interaction.guild.roles.cache.find((r: Role) => r.name.toLowerCase() === "suggestion banned");
					if (!role) return;

					member.roles.remove(role).catch((err: Error) => {
						handleError(err);
					});

					await sendModLogs({ guild: interaction.guild!, mod: interaction.member!, targetUser: user, action: "Suggestion Unban" }, { title: "User Suggestion Unbanned", actionInfo: `**Reason:** ${reason}\n> **Case ID:** ${caseNumber}`, channel: interaction.channel || undefined });

					await Case.findOneAndUpdate({
						guildID: interaction.guild.id,
						userID: member.id,
						caseType: "SUGGESTION BAN",
						active: true
					}, {
						active: false
					});

					return;
				}

				const caseNumberSet = await incrimentCase(interaction.guild);

				const userUnbanned = new MessageResponse()
					.addEmbeds([
						{
							type: EmbedType.Normal,
							description: `**Case:** #${caseNumberSet} | **Mod:** ${interaction.user.username} | **Reason:** ${reason}`
						}
					])
					.setContent(`${config.arrowEmoji} **${user.username}** has been unbanned from suggesting. (**${ubWarns}** warns)`)
					.build();
				interaction.reply(userUnbanned);

				const roleSet = interaction.guild.roles.cache.find((r: Role) => r.name.toLowerCase() === "suggestion banned");
				if (!roleSet) return;

				await sendModLogs({ guild: interaction.guild!, mod: interaction.member!, targetUser: user, action: "Suggestion Unban" }, { title: "User Suggestion Unbanned", actionInfo: `**Reason:** ${reason}\n> **Case ID:** ${caseNumberSet}`, channel: interaction.channel || undefined });

				const newCase2 = new Case({
					guildID: interaction.guild.id,
					userID: user.id,
					modID: interaction.user.id,
					caseNumber: caseNumberSet,
					caseType: "SUGGESTION UNBAN",
					reason: reason,
					duration: "None",
					durationUnix: 0,
					active: null,
					dateIssued: Date.now()
				});
				newCase2.save().catch((err: Error) => {
					handleError(err);
				});

				await Case.findOneAndUpdate({
					guildID: interaction.guild.id,
					caseNumber: isBan.caseNumber
				}, {
					active: false
				});

				await isBan.deleteOne();

				if (!member) return;
				member.roles.remove(roleSet).catch((err: Error) => {
					handleError(err);
				});

				break;

		}


	})
	.addSubcommand(subCommand =>
		subCommand
			.setName("approve")
			.setDescription("Approve a suggestion.")
			.addStringOption(opt =>
				opt
					.setName("suggestion")
					.setDescription("Enter the suggestion you'd like to approve.")
					.setRequired(true)
			)
			.addStringOption(opt =>
				opt
					.setName("reason")
					.setDescription("Enter the reason for approving this suggestion.")
					.setRequired(true)
			)
	)
	.addSubcommand(subCommand =>
		subCommand
			.setName("deny")
			.setDescription("Deny a suggestion.")
			.addStringOption(opt =>
				opt
					.setName("suggestion")
					.setDescription("Enter the suggestion you'd like to deny.")
					.setRequired(true)
			)
			.addStringOption(opt =>
				opt
					.setName("reason")
					.setDescription("Enter the reason for denying this suggestion.")
					.setRequired(true)
			)
	)
	.addSubcommand(subCommand =>
		subCommand
			.setName("delete")
			.setDescription("Delete a suggestion.")
			.addStringOption(opt =>
				opt
					.setName("suggestion")
					.setDescription("Enter the suggestion you'd like to deny.")
					.setRequired(true)
			)
	)
	.addSubcommand(subCommand =>
		subCommand
			.setName("ban")
			.setDescription("Ban a user from suggesting.")
			.addUserOption(opt =>
				opt
					.setName("user")
					.setDescription("Enter a user you'd like to ban")
					.setRequired(true)
			)
			.addStringOption(opt =>
				opt
					.setName("reason")
					.setDescription("Enter the reason for denying this suggestion.")
					.setRequired(true)
			)
			.addStringOption(opt =>
				opt
					.setName("length")
					.setDescription("The length for the suggestion ban.")
					.setRequired(false)
			)
	)
	.addSubcommand(subCommand =>
		subCommand
			.setName("unban")
			.setDescription("Unban a user from suggesting.")
			.addUserOption(opt =>
				opt
					.setName("user")
					.setDescription("Enter a user you'd like to ban")
					.setRequired(true)
			)
			.addStringOption(opt =>
				opt
					.setName("reason")
					.setDescription("Enter the reason for denying this suggestion.")
					.setRequired(true)
			)
	);
