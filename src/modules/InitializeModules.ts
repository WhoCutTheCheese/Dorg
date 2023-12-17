import { Log } from "../utilities/Logging";
import { handleError } from "../utilities/GenUtils";
import { load as RegisterEvents } from "./RegisterEvents";
import { load as RegisterSlashCommands } from "./RegisterSlashCommands";

// Simple function initializing everything
export async function initializeModules(): Promise<void> {
	RegisterEvents().catch((err: Error) => handleError(err)).then(() => Log.info("Successfully registered events."));
	RegisterSlashCommands().catch((err: Error) => handleError(err)).then(() => Log.info("Successfully registered slash commands."));
}