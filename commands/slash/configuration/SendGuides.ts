import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, Message, PermissionFlagsBits, TextChannel, WebhookClient } from "discord.js";
import { client } from "../../../Main";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";
import { config } from "../../../utilities/Config";

export default new CommandExecutor()
	.setName("send_guide")
	.setDescription("Resend any of the server's verious guides.")
	.addStringOption(opt =>
		opt.setName("option")
			.setDescription("Which guide do you want to resend?")
			.setRequired(true)
			.setChoices(
				{ name: "Welcome Embed", value: "welcome" },
				{ name: "Ticket Embed", value: "tickets" },
			)
	)
	.setBasePermission({
		Level: PermissionLevel.Developer,
	})
	.setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
	.setExecutor(async (interaction) => {
		if (!interaction.inCachedGuild()) { interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true }); return; }

		const option = interaction.options.getString("option") || "";

		switch (option) {
			case "welcome":
				const welcomeChannel = interaction.guild.channels.cache.get("1080360678340177960") as TextChannel;
				const welcomeWebhook = await welcomeChannel.createWebhook({ name: "Welcome", avatar: interaction.guild.iconURL() || undefined });

				const welcomeButtons = new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel("Rules")
							.setURL("https://discord.com/channels/1079964060872880229/1080360225145618542"),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel("Roles")
							.setURL("https://discord.com/channels/1079964060872880229/1080360792878227487"),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel("Cool Creations")
							.setURL("https://discord.com/channels/1079964060872880229/1139694378718335056"),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel("Chat")
							.setURL("https://discord.com/channels/1079964060872880229/1081096650199683082"),
						new ButtonBuilder()
							.setStyle(ButtonStyle.Link)
							.setLabel("Tickets")
							.setURL("https://discord.com/channels/1079964060872880229/1081102152577064971")
					);
				const welcomeEmbed = new EmbedBuilder()
					.setAuthor({ name: "Welcome to The Bot Den!", iconURL: interaction.guild.iconURL() || undefined })
					.setColor("Blurple")
					.setDescription("**The Bot Den** is a community for developers of any kind. We are a safe space for new and experienced developers to flourish. Share your creations, talk with likeminded people or just chill out! <a:disco_cat:1139702369169453116>")
					.addFields({
						name: "🌐 Information:", value: `<:blurple_bulletpoint:1139422348357943416> **Founder:** <@493453098199547905>
					<:blurple_bulletpoint:1139422348357943416> **Created:** <t:1677553896:d> (<t:1677553896:R>)`, inline: true
					})
					.addFields({
						name: "🔗 Links:", value: `<:blurple_bulletpoint:1139422348357943416> <:denied:1085364673169342534> **Staff App:** Closed...
					<:blurple_bulletpoint:1139422348357943416> <:denied:1085364673169342534> **Event Lead App:** Closed...`, inline: true
					})
					.setTimestamp(Date.now())
					.setFooter({ text: "Last Updated" });
				await welcomeWebhook.send({ embeds: [welcomeEmbed], components: [welcomeButtons] });
				interaction.reply({ content: "Sent!", ephemeral: true });
				break;
			case "tickets":
				const ticketsChannel = interaction.guild.channels.cache.get("1081102152577064971") as TextChannel;
				const ticketsWebhook = await ticketsChannel.createWebhook({ name: "Ticket System", avatar: interaction.guild.iconURL() || undefined });

				const ticketsButton = new ActionRowBuilder<ButtonBuilder>()
					.addComponents(
						new ButtonBuilder()
							.setStyle(ButtonStyle.Primary)
							.setLabel("Open Ticket")
							.setCustomId("open_ticket")
							.setEmoji("🎟")
					);


				const ticketsEmbed = new EmbedBuilder()
					.setAuthor({ name: "Contact Staff" })
					.setColor("Blurple")
					.setDescription(`Need to contact staff to report someone, inquire about the server, or ask about partnerships? Here's the place to do it!
					https://nohello.net

					__Important Information__
					${config.bulletpointEmoji} If you opened a ticket accidentally, just close the ticket.
					${config.bulletpointEmoji} Do not beg for roles, you will recieve them in time.
					${config.bulletpointEmoji} Do not ping staff, we've already been alerted.`)
					.setTimestamp()
					.setFooter({ text: "Last Updated" });
				ticketsWebhook.send({ embeds: [ticketsEmbed], components: [ticketsButton] });
				interaction.reply({ content: "Sent!", ephemeral: true });
				break;
		}
	});
