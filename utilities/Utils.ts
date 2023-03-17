import { APIButtonComponent, ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputApplicationCommandData, ChatInputCommandInteraction, EmbedBuilder, User, WebhookClient } from "discord.js";
import { Log } from "./Logging";
const ms = require("ms");

/**
 * Returns the current date an time in a string.
 * @returns {string}
 */
export function timeStringNow(): string {
	const now = new Date();
	return `${now.getUTCDate().toString().padStart(2, "0")}-${(now.getUTCMonth() + 1).toString().padStart(2, "0")}-${now.getUTCFullYear().toString().padStart(4, "0")} ${now.getUTCHours().toString().padStart(2, "0")}:${now.getUTCMinutes().toString().padStart(2, "0")}:${now.getUTCSeconds().toString().padStart(2, "0")}:${now.getUTCMilliseconds().toString().padStart(3, "0")}`;
}

export function handleError(err: Error): void {
	Log.error("Uh oh! Dorg has encountered an error.\n\n" + err.message + "\n" + err.stack);
	const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/1085378962546491432/Tr8OuPsXEjyqEIF7N_d3CpbGRab_v3BhugmOhZlP5KrPZpnNtD0B1ZAe7jVre0bAFUTo" });
	const error = new EmbedBuilder()
		.setTitle("Dorg Error!")
		.setColor("Red")
		.addFields(
			{ name: "Error:", value: `\`\`\`${err.message}\`\`\`` }
		);
	webhook.send({ embeds: [error], content: "<@&1085378823350141019>" });
}


export async function promptChannel(interaction: ChatInputCommandInteraction, user: User, description: string, title: string): Promise<any> {

	return new Promise(async (resolve, reject) => {

		let row = new ActionRowBuilder<ButtonBuilder>()
			.addComponents(
				new ButtonBuilder()
					.setCustomId(`cancel.${interaction.user.id}`)
					.setStyle(ButtonStyle.Danger)
					.setLabel("Cancel")
			);
		const embed = new EmbedBuilder()
			.setAuthor({ name: title, iconURL: interaction.guild?.iconURL() || undefined })
			.setDescription(`${description}
		**Example:** #Channel`);
		const reply = await interaction.editReply({ components: [row], embeds: [embed] });
		Promise.race([
			new Promise(async (resolve, reject) => {
				const filter = (i: any) => i.user.id === interaction.user.id;

				const collector = reply.createMessageComponentCollector({ filter, time: ms("10m") });
				collector.on('collect', async (bi: ButtonInteraction) => {
					const id = bi.customId;
					if (id == `cancel.${interaction.user.id}`) {
						row = new ActionRowBuilder<ButtonBuilder>()
							.addComponents(
								ButtonBuilder.from(reply.components[0].components[0] as APIButtonComponent).setDisabled(true),
							);
						await interaction.editReply({ components: [row] });
						reject('Prompt canceled.');
					}
				});
			})
		]).then((c: any) => { resolve(c); })
			.catch(err => { if (!err) interaction.channel?.send(`Prompt timed out`); reject(err); });

	});


}