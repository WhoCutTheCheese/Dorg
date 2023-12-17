import { Collection, REST, Routes } from "discord.js";
import { client } from "../Main";
import { config } from "../utilities/Config";
import dotENV from "dotenv";
import fs from "fs";
import path from "path";
import { Log } from "../utilities/Logging";
import { CommandExecutor } from "../classes/CommandExecutor";
import { createNewGuildFile, handleError } from "../utilities/GenUtils";
import Settings from "../schemas/Settings";
dotENV.config();

declare module "discord.js" {
	export interface Client {
		slashcommands: Collection<string, CommandExecutor>;
		slashcommandsArray: [],
	}
}

export async function load() {
	// Creates the slash command collection, for REST
	client.slashcommands = new Collection();
	client.slashcommandsArray = [];
	// Get the commands path, and folders and loops through the folders getting the files
	const commandPath = path.join(__dirname, "..", "commands", "slash");
	const commandFolders = fs.readdirSync(commandPath);
	for (const folder of commandFolders) {
		const commandFiles = fs.readdirSync(`${commandPath}/${folder}`).filter(file => file.endsWith(".js"));

		for (const file of commandFiles) {
			// Importing the command as the custom CommandExecutor class
			const command = (await import(`${commandPath}/${folder}/${file}`)).default as CommandExecutor;

			// Adding it to the collection and array for REST
			client.slashcommands.set(command.name, command);
			client.slashcommandsArray.push(command.toJSON() as never);

			//Log.debug(`[Loaded]  | Slash Command | ${file}`);


		}
	}
	let clientId = config.clientID;

	// Putting it all into REST for slash commands
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

	// Actually executing the command code, while also ensuring there is a guild file
	client.on("interactionCreate", async interaction => {
		if (!interaction.isChatInputCommand()) return;
		const command = client.slashcommands.get(interaction.commandName);
		if (interaction.inCachedGuild()) {
			const settings = await Settings.findOne({
				guildID: interaction.guild?.id
			});
			if (!settings) {
				await createNewGuildFile(interaction.guild);
			}
		}


		if (!command) return;

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