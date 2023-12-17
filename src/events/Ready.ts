import { Log } from "../utilities/Logging";
import mongoose from "mongoose";
import { client } from "../Main";
import { ActivityType } from "discord.js";

export default {
	name: "ready",
	once: false,
	async execute() {
		Log.info("Dorg is waking up!");

		client.user?.setActivity({
			name: "🌌 Watching the stars...",
			//state: "Watching",
			type: ActivityType.Custom,
		});

		mongoose.connect(`${process.env.MONGO_URI}`);

		Log.info("Dorg has awoken and is ready to hunt.");
	}
};