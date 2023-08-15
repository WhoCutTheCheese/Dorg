import { Message, TextChannel } from "discord.js";
import { appendFileSync, writeFileSync } from "fs";
import { resolve } from "path";

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
	console.log(`${path}/media/${name}`);
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
		if (!(message.channel instanceof TextChannel)) return;
		if (message.channel.parentId !== "1081353828722557028") return;
		const ticketID = message.channel.id;
		const ticketPath = `./transcripts/${ticketID}`;

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