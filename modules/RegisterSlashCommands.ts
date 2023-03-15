import { Collection, REST, Routes } from "discord.js";
import { client } from "../Main";
import { config } from "../utilities/Config";
import dotENV from "dotenv";
import fs from "fs";
import path from "path";
import { Log } from "../utilities/Logging";
import { CommandExecutor } from "../classes/CommandExecutor";
import { handleError } from "../utilities/Utils";
dotENV.config();

declare module "discord.js" {
	export interface Client {
		slashcommands: Collection<string, CommandExecutor>;
		slashcommandsArray: [],
	}
}

export async function load() {

	client.slashcommands = new Collection();
	client.slashcommandsArray = [];
	const commandPath = path.join(__dirname, "..", "commands", "slash");
	const commandFolders = fs.readdirSync(`./commands/slash`);
	for (const folder of commandFolders) {
		const commandFiles = fs.readdirSync(`${commandPath}/${folder}`).filter(file => file.endsWith(".ts"));

		for (const file of commandFiles) {

			Log.debug(`[Get] | Slash Command | ${file}`);

			const command = (await import(`${commandPath}/${folder}/${file}`)).default as CommandExecutor;

			client.slashcommands.set(command.name, command);
			client.slashcommandsArray.push(command.toJSON() as never);

			Log.debug(`[Loaded]  | Slash Command | ${file}`);
		}
	}
	let clientId = config.clientID;

	const rest = new REST({ version: '10' }).setToken(process.env.TOKEN!);

	(async () => {
		try {
			Log.info("Registering all (/) commands.");

			await rest.put(
				Routes.applicationCommands(clientId),
				{ body: client.slashcommandsArray });

			Log.info("Registered all (/) commands");
		} catch (error) {
			console.error(error);
		}
	})();

	client.on("interactionCreate", async interaction => {
		if (!interaction.isChatInputCommand()) return;
		const command = client.slashcommands.get(interaction.commandName);


		if (!command) return;
		// for (const perm of command.perms(interaction)) {
		//     Log(LogLevel.Debug, `${typeof (perm)}`)
		// }

		try {
			const permResult = await command.hasPermission(interaction);
			if (permResult.success == false) {
				await interaction.reply({ content: permResult.content || "You are not authorized to execute this command.", ephemeral: true });
				return;
			}
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction
				.reply({ content: 'There was an error while executing this command!', ephemeral: true })
				.catch((err: Error) => handleError(err));
		}
	});
}
