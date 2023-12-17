import { client } from "../Main";
import path from "path";
import fs from "fs";

export async function load() {

	// Getting the events path and all the files
	const eventPath = path.join(__dirname, "..", "events");
	const eventFiles = fs.readdirSync(eventPath).filter(file => file.endsWith(".js"));
	// Looping through all the event files
	for (const file of eventFiles) {
		const filePath = path.join(eventPath, file);
		const event = (await import(filePath)).default;
		// Importing and executing each event, either once or every time it's triggered.
		if (event.once) {
			client.once(event.name, (...args) => event.execute(...args));
		} else {
			client.on(event.name, (...args) => event.execute(...args));
		}
	}

}