import { ButtonStyle, Message, PermissionFlagsBits } from "discord.js";
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
		const response = new MessageResponse()
			.addEmbeds([
				{
					type: EmbedType.Normal,
					description: `This is a test embed.`
				},
				{
					type: EmbedType.Error,
					description: "This is an error embed!"
				}
			])
			.addButtons([
				{
					style: ButtonStyle.Link,
					label: "Test button :3",
					url: "https://google.com"
				}
			])
			.build();
		interaction.reply(response);
	});
