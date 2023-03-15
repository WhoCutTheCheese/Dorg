import { client } from "../Main";
import path from "path";
import fs from "fs";

export async function load() {

	const eventPath = path.join(__dirname, "..", "events");
	const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith(".ts"));
	for (const file of eventFiles) {
		const filePath = path.join(eventPath, file);
		const event = (await import(filePath)).default;
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}

}