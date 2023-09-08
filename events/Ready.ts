import { config } from "../utilities/Config";
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

		Log.info("Dorg has awoken and is ready to hunt.");
	}
};
