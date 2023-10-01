import { CategoryChannel, ChannelType, Message, TextChannel } from "discord.js";
import { appendFileSync, writeFileSync } from "fs";
import path, { resolve } from "path";
import RoleBans from "../schemas/RoleBans";

function addSpacesToEachLine(str: string) {
	return str.split("\n").map(line => "    " + line).join("\n");
}
function generateUniqueCharacters() {
	const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789_";
	let result = "";
	while (result.length < 8) {
		let randomIndex = Math.floor(Math.random() * characters.length);
		if (!result.includes(characters[randomIndex])) {
			result += characters[randomIndex];
		}
	}
	return result;
}
async function downloadAttachment(url: string, path: string, name: string) {
	const response = await fetch(url);
	const buffer = Buffer.from(await response.arrayBuffer());
	//console.log(`${path}/media/${name}`);
	writeFileSync(`${path}/media/${name}`, buffer);
	return resolve(`${path}/media/${name}`);
}

const contentTypeFilter = [
	'image/png',
	'image/jpg',
	'image/jpeg',
	'image/JPG',
	'image/JPEG'
];

export default {
	name: "messageCreate",
	once: false,
	async execute(message: Message) {
		const foundBan = await RoleBans.find({
			guildID: message.guild?.id,
			userID: message.author.id,
		});
		if (foundBan) {
			for (const file of foundBan) {
				if (!message.member?.roles.cache.has(file.roleID!)) {
					message.member?.roles.add(file.roleID!).catch(() => { });
				}
			}
		}
		if (!(message.channel instanceof TextChannel)) return;
		if (message.channel.parentId !== (message.guild?.channels.cache.find(c => c.name == "💥 Tickets" && c.type === ChannelType.GuildCategory) as CategoryChannel).id) return;
		const ticketID = message.channel.id;
		const ticketPath = path.join(__dirname, "..", "transcripts", `${ticketID}`);

		appendFileSync(`${ticketPath}/ticket_transcript.md`, `\n\nFrom [${message.author.tag}](https://www.discord.com/users/${message.author.id}) at \`${message.createdAt}\``);
		appendFileSync(`${ticketPath}/ticket_transcript.txt`, `\n${message.author.tag} (${message.author.id}) at ${message.createdAt}:`);

		if (message.content) {
			const replaced = addSpacesToEachLine(message.content);
			appendFileSync(`${ticketPath}/ticket_transcript.md`, `\n\n${replaced}`);
			appendFileSync(`${ticketPath}/ticket_transcript.txt`, `\n\n${replaced}`);
		}
		if (message.attachments && message.attachments.size >= 1) {
			for (const attachment of Array.from(message.attachments.values())) {
				const name = generateUniqueCharacters();
				if (contentTypeFilter.find(x => x === attachment.contentType)) {
					const p = await downloadAttachment(attachment.url, ticketPath, name + "." + attachment.contentType!.split("/")[1]);
					appendFileSync(`${ticketPath}/ticket_transcript.md`, `\n\n![User uploaded file "${name}"](./media/${name + "." + attachment.contentType!.split("/")[1]})`);
					appendFileSync(`${ticketPath}/ticket_transcript.txt`, `\n\n[IMAGE at "${name}"; you can find this image in the transcript thread, uploaded by RDB as an attachment.]`);
				}
			}
		}
	}
};