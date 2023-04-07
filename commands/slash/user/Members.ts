import { EmbedBuilder, GuildMember } from "discord.js";
import { CommandExecutor, PermissionLevel } from "../../../classes/CommandExecutor";

export default new CommandExecutor()
	.setName("members")
	.setDescription("Get The Bot Den's members.")
	.setBasePermission({
		Level: PermissionLevel.None,
	})
	.setExecutor(async (interaction) => {
		if (!interaction.inCachedGuild()) { interaction.reply({ content: "You must be inside a cached guild to use this command!", ephemeral: true }); return; }
		await interaction.deferReply();

		const fetchedMembers = interaction.guild.members.fetch();
		const totalHumans = (await fetchedMembers).filter((member: GuildMember) => !member.user.bot).size.toLocaleString();

		const members = new EmbedBuilder()
			.setDescription(`We currently have **${totalHumans} members**!`)
			.setColor("Random");
		await interaction.editReply({ embeds: [members] });

	});
