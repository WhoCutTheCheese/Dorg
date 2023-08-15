import { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, CategoryChannel, ChannelType, ChatInputCommandInteraction, Embed, EmbedBuilder, Interaction, ModalBuilder, PermissionsBitField, Role, TextChannel, TextInputBuilder, TextInputStyle, ThreadAutoArchiveDuration } from "discord.js";
import { errorEmbed, handleError, incrimentTicket } from "../utilities/Utils";
import Tickets from "../schemas/Tickets";
import { Log } from "../utilities/Logging";
import { existsSync, mkdirSync, writeFileSync, readdirSync, readFileSync, rmSync } from "fs";
import path from "path";
import { escapeRegExp } from "lodash";
import { client } from "../Main";
import { config } from "../utilities/Config";

/**
 * Do not create tickets with these numbers
 * 
 * This was originally implemented due to a discord Server Discovery guidelines violation bug, where ticket-1488 would trigger an error.
 * ^ UPDATE 6/11: this is not a bug; "1488" was just banned because apparently it is associated with a hate speech group
 */
const SkipTickets = [
	1488,
	69,
	420,
	69420,
];

export default {
	name: "interactionCreate",
	once: false,
	async execute(interaction: Interaction) {
		if (!interaction.inCachedGuild()) return;
		if (interaction.isButton()) {
			const customID = interaction.customId;

			switch (customID) {
				case "open_ticket":
					await interaction.deferReply({ ephemeral: true });

					if (interaction.member.roles.cache.find((r: Role) => r.name.toLowerCase() === "ticket banned")) {
						await interaction.editReply({ embeds: [errorEmbed("You are banned from opening tickets.")] });
						return;
					}

					const findTicket = await Tickets.findOne({
						guildID: interaction.guild.id,
						creatorID: interaction.user.id,
						status: true,
					});
					if (findTicket) {
						const ticketChannel = interaction.guild.channels.cache.get(findTicket.channelID!);
						if (ticketChannel) {
							await interaction.editReply({ embeds: [errorEmbed("You already have a ticket open.")] });
							return;
						} else {
							await findTicket.deleteOne();
						}
					}

					let category = interaction.guild.channels.cache.find(c => c.name == "💥 Tickets" && c.type === ChannelType.GuildCategory) as CategoryChannel;
					if (!category) {
						await interaction.editReply({ embeds: [errorEmbed("No ticket category found. Please contact an administrator!")] });
						return;
					}
					const juniorMod = interaction.guild.roles.cache.find(r => r.name === "Junior Moderator");


					let ticketNum = await incrimentTicket(interaction.guild);
					if (SkipTickets.find(t => { t === ticketNum; })) {
						Log.debug(`Ticket #${ticketNum} has been skipped.`);
						ticketNum = await incrimentTicket(interaction.guild);
					}

					const newChannel = await interaction.guild.channels.create({
						name: `ticket-${ticketNum}`,
						type: ChannelType.GuildText,
						permissionOverwrites: [
							{
								id: interaction.guild.id,
								deny: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
							},
							{
								id: interaction.user.id,
								allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory, PermissionsBitField.Flags.AttachFiles]
							},
							{
								id: juniorMod!.id,
								allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ReadMessageHistory]
							}
						],
						reason: `Ticket opened by ${interaction.user.username}.`,
						parent: category,
					}).catch(async (err: Error) => {
						await interaction.editReply({ embeds: [errorEmbed("Unable to create ticket channel! Please try again.")] });
						return;
					});
					if (!newChannel) {
						await interaction.editReply({ embeds: [errorEmbed("Unable to create ticket channel! Please try again.")] });
						return;
					}

					const transcriptPath = `./transcripts/${newChannel.id}`;
					if (existsSync(transcriptPath)) {
						await interaction.editReply({ embeds: [errorEmbed(`I had an error with the transcripts! Please contact an administrator with a screenshot of this message. \`T-${ticketNum}\``)] });
						return;
					}

					mkdirSync(transcriptPath);

					const meta = {
						creator: interaction.user.id,
						ticketID: newChannel.id,
						date: new Date()
					};

					writeFileSync(`${transcriptPath}/ticket_meta.json`, JSON.stringify(meta));
					writeFileSync(`${transcriptPath}/ticket_transcript.md`, "");
					writeFileSync(`${transcriptPath}/ticket_transcript.txt`, "");
					mkdirSync(`${transcriptPath}/media`);

					const ticketRow = new ActionRowBuilder<ButtonBuilder>()
						.addComponents(
							new ButtonBuilder()
								.setCustomId("close_ticket")
								.setStyle(ButtonStyle.Danger)
								.setLabel("Close Ticket")
								.setEmoji("✖")
						);

					const ticketEmbed = new EmbedBuilder()
						.setAuthor({ name: `${interaction.user.username}'s Ticket`, iconURL: interaction.user.displayAvatarURL() || undefined })
						.setColor("Blurple")
						.setDescription(`Please describe why you opened this ticket briefly, a staff member will be with your shortly.
							
							If you opened this ticket by mistake, please leave a short response and close the ticket.`)
						.setTimestamp()
						.setFooter({ text: "Ticket transcripts are saved permanently." });
					newChannel.send({ content: `<@${interaction.user.id}> <@&1081104149111918662> https://nohello.net`, embeds: [ticketEmbed], components: [ticketRow] });

					const newTicket = new Tickets({
						guildID: interaction.guild.id,
						creatorID: interaction.user.id,
						users: [],
						channelID: newChannel.id,
						claimedID: "None",
						closeReason: "None",
						status: true
					});
					newTicket.save().catch(async (err: Error) => {
						await interaction.editReply({ embeds: [errorEmbed("No ticket category found. Please contact an administrator!")] });
						return;
					});
					await interaction.editReply({ content: `Your ticket has been created. <#${newChannel.id}>` });
					break;
				case "close_ticket":
					const postForm = new ModalBuilder()
						.setCustomId("modal_close_reason")
						.setTitle("Enter a Reason");
					const postInputs = [
						new TextInputBuilder()
							.setCustomId('close_reason')
							.setLabel("Reason")
							.setPlaceholder("Ticket resolved.")
							.setRequired(true)
							.setMaxLength(250)
							.setStyle(TextInputStyle.Paragraph),
					];
					for (const input of postInputs)
						postForm.addComponents(new ActionRowBuilder<TextInputBuilder>().setComponents(input));
					await interaction.showModal(postForm);
					break;
				case "log_transcript":
					await interaction.deferReply({ ephemeral: true });

					if (!interaction.member.roles.cache.find((r: Role) => r.name.toLowerCase() === "junior moderator")) {
						interaction.editReply({ embeds: [errorEmbed("You must be an Junior Mod to use this!")] });
						return;
					}
					const foundTicket = await Tickets.findOne({
						guildID: interaction.guild.id,
						channelID: interaction.channel?.id
					});
					if (!foundTicket) return;

					interaction.channel?.send({ content: `Transcript and media being send to the transcripts channel now.` });
					transcriptString(interaction.channel?.name!, interaction.channel?.id!, interaction, interaction.user.id);
					let ticketRow2 = new ActionRowBuilder<ButtonBuilder>()
						.addComponents(
							new ButtonBuilder()
								.setCustomId("log_transcript")
								.setStyle(ButtonStyle.Secondary)
								.setLabel("Log Transcript")
								.setDisabled(true)
								.setEmoji("📰"),
							new ButtonBuilder()
								.setCustomId("delete_ticket")
								.setStyle(ButtonStyle.Danger)
								.setLabel("Delete Ticket")
								.setEmoji("🗑"),
						);
					await interaction.message.edit({ components: [ticketRow2] });
					interaction.editReply({ content: "Transcript logged." });
					break;
				case "delete_ticket":
					await interaction.deferReply({});

					if (!interaction.member.roles.cache.find((r: Role) => r.name.toLowerCase() === "junior moderator")) {
						interaction.editReply({ embeds: [errorEmbed("You must be an Junior Mod to use this!")] });
						return;
					}
					await Tickets.findOneAndDelete({
						guildID: interaction.guild.id,
						channelID: interaction.channel?.id
					});

					let ticketRow3 = new ActionRowBuilder<ButtonBuilder>()
						.addComponents(
							new ButtonBuilder()
								.setCustomId("log_transcript")
								.setStyle(ButtonStyle.Secondary)
								.setLabel("Log Transcript")
								.setDisabled(true)
								.setEmoji("📰"),
							new ButtonBuilder()
								.setCustomId("delete_ticket")
								.setStyle(ButtonStyle.Danger)
								.setLabel("Delete Ticket")
								.setDisabled(true)
								.setEmoji("🗑"),
						);
					await interaction.message.edit({ components: [ticketRow3] });

					await interaction.editReply({ content: "Ticket file deleted, deleting channel soon." });
					setTimeout(async () => {
						rmSync('./transcripts/' + interaction.channel?.id, { recursive: true, force: true });
						await interaction.channel?.delete("Ticket closed");
					}, 10000);
			}
		} else if (interaction.isModalSubmit()) {
			const customID = interaction.customId;
			await interaction.deferReply({ ephemeral: true });

			switch (customID) {
				case "modal_close_reason":

					const foundTicket = await Tickets.findOne({
						guildID: interaction.guild.id,
						channelID: interaction.channel?.id
					});
					if (!foundTicket) return;
					await foundTicket.updateOne({
						closeReason: interaction.fields.getTextInputValue('close_reason') || "No reason found!",
						status: false
					});

					let ticketRow = new ActionRowBuilder<ButtonBuilder>()
						.addComponents(
							new ButtonBuilder()
								.setCustomId("close_ticket")
								.setStyle(ButtonStyle.Danger)
								.setLabel("Close Ticket")
								.setDisabled(true)
								.setEmoji("✖"),
						);
					await interaction.message?.edit({ components: [ticketRow] });

					ticketRow = new ActionRowBuilder<ButtonBuilder>()
						.addComponents(
							new ButtonBuilder()
								.setCustomId("log_transcript")
								.setStyle(ButtonStyle.Secondary)
								.setLabel("Log Transcript")
								.setEmoji("📰"),
						);

					const ticketClosed = new EmbedBuilder()
						.setAuthor({ name: `Ticket Closed - ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() || undefined })
						.setDescription(`Ticket has been closed. The ticket creator, and any added users have been removed and can no longer view the ticket.
						**Reason:** ${interaction.fields.getTextInputValue('close_reason') || "No reason found!"}
						
						Click \`Log Transcript\` to log the transcript.`)
						.setTimestamp();
					interaction.channel?.send({ embeds: [ticketClosed], components: [ticketRow] });

					await interaction.channel?.edit({
						name: `closed-${interaction.channel.name.split('-')[1]}`
					}).catch(async (err: Error) => {
						handleError(err);
						await interaction.editReply({ embeds: [errorEmbed(`An error occurred!\n\`${err.name}\``)] });
						return;
					});
					await (interaction.channel as TextChannel).permissionOverwrites.edit(foundTicket.creatorID!, { ViewChannel: false, SendMessages: false, ReadMessageHistory: false });
					for (const user of foundTicket.users) {
						await (interaction.channel as TextChannel).permissionOverwrites.edit(user, { ViewChannel: false, SendMessages: false, ReadMessageHistory: false });
					}
					interaction.editReply({ content: "Ticket closed." });

					break;
			}
		}

	}
};


async function getTicketTranscriptByID(id: string) {
	try {
		const media = readdirSync(`./transcripts/${id}/media`);
		const md = readFileSync(`./transcripts/${id}/ticket_transcript.md`);
		const txt = readFileSync(`./transcripts/${id}/ticket_transcript.txt`);
		return { media, md, txt };
	} catch (err) {
		Log.error(err);
		handleError(err as any);
	}
	return null;
}

async function transcriptString(ticketname: string, ticket_id: string, interaction: Interaction, closerID: string) {
	const scriptsChannel = await client.channels.fetch("1081353700586565652").catch((err: Error) => { Log.error(err); handleError(err); });
	if (!scriptsChannel) return;

	const foundTicket = await Tickets.findOne({
		guildID: interaction.guild?.id,
		channelID: ticket_id,
	});
	if (!foundTicket) return;
	const user = await client.users.fetch(foundTicket.creatorID!);

	const results = await getTicketTranscriptByID(ticket_id);
	const transcriptEmbed = new EmbedBuilder()
		.setAuthor({ name: `Ticket-${(interaction.channel as TextChannel)?.name.split('-')[1]} Transcript`, iconURL: interaction.guild?.iconURL() || undefined })
		.setThumbnail(user.displayAvatarURL() || null)
		.setDescription(`${config.bulletpointEmoji} **Creator:** <@${foundTicket.creatorID}>
		${config.bulletpointEmoji} **Closer:** <@${closerID}>
		${config.bulletpointEmoji} **Reason:** ${foundTicket.closeReason}`)
		.setTimestamp();
	if (!results) {
		// Backup: no transcript session was found
		const fetched = await interaction.channel?.messages.fetch({ limit: 100 });
		if (!fetched) return;
		let s = "";
		for (const msg of Array.from(fetched.values())) {
			s += `From ${msg.author.tag} (${msg.author.id})\n    ` + (msg.content ?? "") + "\n";
		}
		const buffer = Buffer.from(escapeRegExp(s), 'utf-8');
		await (scriptsChannel as TextChannel).send({
			embeds: [transcriptEmbed],
			files: [
				{ attachment: buffer, name: ticketname + ".txt" }
			]
		});
		return;
	}
	await (scriptsChannel as TextChannel).send({
		embeds: [transcriptEmbed],
		files: [
			{ attachment: results.md, name: ticketname + '.md' },
			{ attachment: results.txt, name: ticketname + '.txt' }
		]
	});
	const thread = await (scriptsChannel as TextChannel).threads.create({
		name: `Ticket-${(interaction.channel as TextChannel)?.name.split('-')[1]} Media`,
		autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
		reason: 'Ticket Media'
	});
	for (const mediaFile of results.media) {
		await thread.send({
			content: mediaFile,
			files: [
				`./transcripts/${ticket_id}/media/${mediaFile}`
			]
		});
	}
}