import { EmbedBuilder, WebhookClient } from "discord.js";
import { Log } from "./Logging";

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