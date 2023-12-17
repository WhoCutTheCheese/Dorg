import dotENV from "dotenv";
import { Log } from "./Logging";
export const config = require("../../config.json");
dotENV.config();

export async function validateConfig() {

	if (!config.clientID) {
		Log.error("You are missing the \"clientID\" argument in config.json. Slash commands will not work.");
	}
	if (!config.successEmoji) {
		Log.warn("You are missing the \"successEmoji\" argument in config.json. Some emojis may not work.");
	}
	if (!config.failedEmoji) {
		Log.warn("You are missing the \"failedEmoji\" argument in config.json. Some emojis may not work.");
	}
	if (!config.arrowEmoji) {
		Log.warn("You are missing the \"arrowEmoji\" argument in config.json. Some emojis may not work.");
	}
	if (!config.bulletpointEmoji) {
		Log.warn("You are missing the \"bulletpointEmoji\" argument in config.json. Some emojis may not work.");
	}
	if (!config.devs) {
		Log.warn("You are missing the \"devs\" array argument in config.json. PermissionLevel.Developer will not function.");
	}
	config.token = process.env.TOKEN;
	config.mongo_uri = process.env.MONGO_URI;

	if (!config.mongo_uri) {
		Log.error("You are missing the \"MONGO_URI\" evironment variable! Make sure you have a .env file with the mongo uri in it.");
	}

	if (!config.token) {
		Log.error("You are missing the \"TOKEN\" evironment variable! Make sure you have a .env file with the token in it.");
	}

}