import { Log } from "../utilities/Logging";
import { handleError } from "../utilities/Utils";
import { load as RegisterEvents } from "./RegisterEvents";
import { load as RegisterSlashCommands } from "./RegisterSlashCommands";

export async function initializeModules(): Promise<void> {
	RegisterEvents().catch((err: Error) => handleError(err)).then(() => Log.info("Successfully registered events."));
	setTimeout(async () => {
		RegisterSlashCommands().catch((err: Error) => handleError(err)).then(() => Log.info("Successfully registered slash commands."));
	}, 10000);
}