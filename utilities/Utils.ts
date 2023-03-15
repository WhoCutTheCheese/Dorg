import { Log } from "./Logging";

/**
 * Returns the current date an time in a string.
 * @returns {string}
 */
export function timeStringNow(): string {
	const now = new Date();
	return `${now.getUTCDate().toString().padStart(2, "0")}-${(now.getUTCMonth() + 1).toString().padStart(2, "0")}-${now.getUTCFullYear().toString().padStart(4, "0")} ${now.getUTCHours().toString().padStart(2, "0")}:${now.getUTCMinutes().toString().padStart(2, "0")}:${now.getUTCSeconds().toString().padStart(2, "0")}:${now.getUTCMilliseconds().toString().padStart(3, "0")}`;
}

export function handleError(err: Error): void {
	Log.error("Uh oh! Dorg has encountered an error.\n\n" + err.message + "\n" + err.stack);
}