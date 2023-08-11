import { config } from "../utilities/Config";
import { Log } from "../utilities/Logging";
import mongoose from "mongoose";

export default {
	name: "ready",
	once: false,
	async execute() {
		Log.info("Dorg is waking up!");

		mongoose.set("strictQuery", true);
		mongoose.connect(`${config.mongo_uri}`);

		Log.info("Dorg has awoken and is ready to hunt.");
	}
};