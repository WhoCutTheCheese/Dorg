import { WebhookClient, EmbedBuilder, Guild, InteractionReplyOptions, AttachmentBuilder, Channel, GuildBasedChannel, GuildMember, PermissionsBitField, TextChannel, User } from "discord.js";
import { Log } from "./Logging";
import Settings from "../schemas/Settings";
import os from "os";
import { EmbedType, MessageResponse } from "../classes/MessageResponse";
import { config } from "./Config";
import { convertMany } from "convert";

/**
 * The error handling function. Just sends a webhook thing
 * @param err Enter a valid error
 */
export function handleError(err: Error): void {
	Log.error("Uh oh! Dorg has encountered an error.\n\n" + err.message + "\n" + err.stack);
	const webhook = new WebhookClient({ url: "https://discord.com/api/webhooks/1165711387125895178/zM8o6XJRPn-dLwnPpSdOHuR4-4dHGxjw9NXOrwKSZsHmxoOz5sBtNdHaaGQ2HqW88CGC" });
	const error = new EmbedBuilder()
		.setTitle("Dorg Error!")
		.setColor("Red")
		.addFields(
			{ name: "Error:", value: `\`\`\`${err.message}\`\`\`` }
		);
	webhook.send({ embeds: [error] });
}

/**
 * Returns the current date an time in a string.
 * @returns {string}
 */
export function timeStringNow(): string {
	const now = new Date();
	return `${now.getUTCDate().toString().padStart(2, "0")}-${(now.getUTCMonth() + 1).toString().padStart(2, "0")}-${now.getUTCFullYear().toString().padStart(4, "0")} ${now.getUTCHours().toString().padStart(2, "0")}:${now.getUTCMinutes().toString().padStart(2, "0")}:${now.getUTCSeconds().toString().padStart(2, "0")}:${now.getUTCMilliseconds().toString().padStart(3, "0")}`;
}

/**
 * Creates a new guild settings file with MongoDB using Mongoose
 * @param guild A guild type
 */
export async function createNewGuildFile(guild: Guild) {
	const newSettings = new Settings({
		guildID: guild.id,
		modLogChannel: "None",
		suggestionChannel: "None",
		caseCount: 0,
		ticketCount: 0,
		suggestionCount: 0,
	});
	newSettings.save().catch((err: Error) => {
		handleError(err);
	});
}

/**
 * Just sends a error embed that is ephemeral
 * @param string The string for the error message
 * @returns InteractionReplyOptions
 */
export function errorEmbed(string: string): InteractionReplyOptions {
	const errorEmbed = new MessageResponse()
		.addEmbeds([
			{
				type: EmbedType.Error,
				description: `${config.failedEmoji} ${string}`
			}
		])
		.setEphemeral(true)
		.build();
	return errorEmbed;
}

/**
 * Incriments the case count for punishments.
 * @param guild The guild where the case number is incrimented
 * @returns Promise<number>
 */
export async function incrimentCase(guild: Guild): Promise<number> {
	const settings = await Settings.findOne({
		guildID: guild.id
	});

	await settings?.updateOne({
		$inc: { caseCount: 1 }
	});

	return settings?.caseCount || 0;
}

/**
 * Incriments the suggestion count for... yk suggestions
 * @param guild The guild where the suggestion number is incrimented
 * @returns Promise<number>
 */
export async function incrimentSuggestion(guild: Guild): Promise<number> {
	const settings = await Settings.findOne({
		guildID: guild.id
	});

	await settings?.updateOne({
		$inc: { suggestionCount: 1 }
	});

	return settings?.suggestionCount || 0;
}

/**
 * Incriments the ticket count for tickets
 * @param guild The guild where the ticket number is incrimented
 * @returns Promise<number>
 */
export async function incrimentTicket(guild: Guild): Promise<number> {
	const settings = await Settings.findOne({
		guildID: guild.id
	});

	await settings?.updateOne({
		$inc: { ticketCount: 1 }
	});

	return settings?.ticketCount || 0;
}

/**
 * Send the modlog embed
 * @param options All the options for the modlogs
 * @param embedDetails The details for the modlog embed
 * @returns Promise<void>
 */
export async function sendModLogs(
	options: {
		guild: Guild;
		mod: GuildMember;
		target?: GuildMember;
		targetUser?: User;
		action?: string;
		attachments?: Array<AttachmentBuilder>;
	},
	embedDetails: {
		title: string;
		actionInfo: string;
		channel?: Channel;
	}
) {
	const { guild } = options;
	const settings = await Settings.findOne({
		guildID: guild.id
	});
	if (!settings) return;

	let user: User = options.target?.user!;
	if (!user) {
		user = options.targetUser!;
	}

	let mod: GuildMember = options.mod;
	if (options.targetUser) {
		user = options.targetUser;
	}
	let users = `<:folder:977391492790362173> **Mod:** ${mod.user.username} (${mod.id})`;
	if (user) {
		users = users + `\n<:user:977391493218181120> **User:** ${(user as User).username} (${user.id})`;
	}
	let action = `> ${embedDetails.actionInfo}`;
	let theChannel = ``;
	if (embedDetails.channel) {
		theChannel = `\n<:channel:1071217768046800966> **Channel:** <#${embedDetails.channel.id}>`;
	}

	const modLogEmbed = new EmbedBuilder()
		.setAuthor({ name: embedDetails.title, iconURL: mod.displayAvatarURL() || undefined })
		.setDescription(`${users} ${theChannel}\n<:clock:1071213725610151987> **Date:** <t:${Math.round(Date.now() / 1000)}:D>\n${action}`)
		.setColor("Blurple");
	const channel = guild?.channels.cache.find((c: GuildBasedChannel) => c.name.toLowerCase() === "mod-logs");
	if (channel) {
		if (guild.members.me?.permissionsIn(channel!).has([PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.EmbedLinks])) {
			if (options.attachments) {
				await (guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed], files: options.attachments });
			} else {
				await (guild.channels.cache.find((c: any) => c.id === channel?.id) as TextChannel).send({ embeds: [modLogEmbed] });
			}
		}
	}
}

/**
 * Returns the current date an time in a string.
 * @param {string} string Input the string you'd like to test for time.
 * @returns {[number, string]}
 */
export function getLengthFromString(string: string): [number, string] | [null, null] {
	try {
		let lengthString: string | null = string;
		if (Number(string)) lengthString = `${string}s`;
		let length = convertStringToTime(lengthString);
		if (!length) return [null, null];
		lengthString = convertShortToLongTime(lengthString);
		if (!lengthString) return [null, null];

		return [length, lengthString];
	} catch (err) {
		return [null, null];
	}
}

function convertStringToTime(string: string): number | null {
	let lengthNum: number | null = null;

	if (string.replace(/\d/g, "") == "m") string = string.replace(/\D/g, '').concat("min");

	try { lengthNum = convertMany(string).to('s'); }
	catch (err) { return null; }

	return lengthNum;
}

function convertShortToLongTime(shortTime: string): string {
	const timeParts = shortTime.match(/^(\d+)([ywdhms]|mo)$/);
	if (!timeParts) { return ""; }

	const value = parseInt(timeParts[1], 10);
	const unit = timeParts[2];

	switch (unit) {
		case 'y':
			return `${value} year(s)`;
		case 'mo':
			return `${value} month(s)`;
		case 'w':
			return `${value} week(s)`;
		case 'd':
			return `${value} day(s)`;
		case 'h':
			return `${value} hour(s)`;
		case 'm' || "min":
			return `${value} minute(s)`;
		case 's':
			return `${value} second(s)`;
		default:
			throw new Error(`Invalid time unit: ${unit}`);
	}
}

export function getMaxRAM(): string {
	const totalRam = os.totalmem(); // Total RAM in bytes
	const maxRamInMB = Math.round(totalRam / (1024 * 1024)); // Convert to MB
	return formatRAM(maxRamInMB);
}

export function getUsedRAM(): string {
	const usedRamInMB = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
	return formatRAM(usedRamInMB);
}

function formatRAM(ramInMB: number): string {
	if (ramInMB >= 1024) {
		const ramInGB = ramInMB / 1024;
		return `${ramInGB.toFixed(2)} GB`;
	} else {
		return `${ramInMB} MB`;
	}
}