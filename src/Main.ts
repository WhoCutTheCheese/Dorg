import { Client, GatewayIntentBits } from "discord.js";
import mongoose from "mongoose";
import { handleError } from "./utilities/GenUtils";
import { Log } from "./utilities/Logging";
import { config, validateConfig } from "./utilities/Config";
import { initializeModules } from "./modules/InitializeModules";

export const client = new Client({
	intents: [
		GatewayIntentBits.GuildMembers,
		GatewayIntentBits.DirectMessages,
		GatewayIntentBits.GuildMessageReactions,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.GuildModeration,
		GatewayIntentBits.Guilds,
		GatewayIntentBits.MessageContent
	]
});

async function run() {
	await initializeModules().catch((err: Error) => handleError(err)).then(() => Log.info("Successfully initialized all modules."));
	await validateConfig().catch((err: Error) => handleError(err)).then(() => Log.info("Successfully validated the configuration file."));
	client.login(config.token);
}

run();

import "./tasks/BanCheck";
import "./tasks/CaseActiveCheck";
import "./tasks/RoleBansCheck";
//import "./tasks/VerifiedUnverifiedCheck";

process.on('unhandledRejection', (err: Error) => handleError(err));
process.on('uncaughtException', (err: Error) => handleError(err));
client.on("error", (err: Error) => handleError(err));
mongoose.connection.on("error", (err: Error) => { handleError(err); process.exit(500); });
mongoose.connection.on('connected', () => { Log.debug("Mongoose has connected successfully."); });