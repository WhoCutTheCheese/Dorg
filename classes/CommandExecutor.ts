import { ChatInputCommandInteraction, InteractionReplyOptions, PermissionsBitField, Role, SlashCommandBuilder } from 'discord.js';
import { promisify } from 'node:util';
import settings from '../schemas/Settings';
import { config } from '../utilities/Config';


/**
 * Permission type for commands.
 * @param {PermissionLevel} Level Level for command use. 
 * @param {string[]} HasRole Array of Role IDs required to use a command.
 * @param {string[]} IsUser Array of User IDs required to use a command.
 * @param {string[]} NotRole Array of Role IDs that a user must not have to use a command.
 * @param {string[]} NotUser Array of User IDs disallowed from using a command.
 */
export type Permission = {
	/** Permission level required for the command. */
	Level: PermissionLevel,
	/** Has any of the roles in the array */
	HasRole?: string[],
	/** Does not have any of the roles in the array, which would override the above argument. */
	NotRole?: string[];
	/** Is any of the users in the array. */
	IsUser?: string[],
	/** Is not any of the users in the array. */
	NotUser?: string[],
};

/**
 * Permission level for commands.
 * @enum {PermissionLevel} Level for command use. 
 */
export enum PermissionLevel {
	/** No permission required to use the command. */
	None,
	/** Requires the Assistant Moderator role. */
	JuniorModerator,
	/** Requires the Moderator role. */
	Moderator,
	/** Requires the Administrator role. */
	Administrator,
	/** Must be a part of the devs array in config.json. */
	Developer,
}


/** The main action of a command. */
type Executor = (interaction: ChatInputCommandInteraction) => Promise<void> | void;

/** The results of checking user permissions. */
interface PermissionsResult extends InteractionReplyOptions {
	success: boolean;
}

/** A user-facing command. */
export class CommandExecutor extends SlashCommandBuilder {
	#executor: Executor;
	#base_permission: Permission;

	constructor() {
		super();
		this.#executor = function () {
			throw new Error('Command executor unimplemented (call setExecutor before exporting commands)');
		};
		this.#base_permission = { Level: PermissionLevel.None };
	}

	/**
	 * Sets the {@link executor}.
	 * @param executor The actual executor.
	 * @returns {RDBCommand}
	*/
	setExecutor(executor: Executor): CommandExecutor {
		this.#executor = executor;
		return this;
	}

	/** Sets the base permissions that will always apply to the command. */
	setBasePermission(permission: Permission): CommandExecutor {
		this.#base_permission = permission;
		return this;
	}

	/**
	 * Checks if the user has permission to run this command.
	 * @param {Interaction} interaction
	 * @returns The result of checking if the user has permission to run the command.
	 */
	async hasPermission(interaction: ChatInputCommandInteraction): Promise<PermissionsResult> {
		if (!interaction.inCachedGuild()) return { success: false, content: "You must use this in a guild." };
		if (!(interaction.member?.permissions as Readonly<PermissionsBitField>)?.has([
			PermissionsBitField.Flags.SendMessages,
			PermissionsBitField.Flags.EmbedLinks])) {
			return {
				success: false
			};
		}
		const roles = await settings.findOne({
			guildID: interaction.guild?.id,
		});
		if (!roles) return { success: true };
		if (!this.#base_permission.NotRole) this.#base_permission.NotRole = [];
		if (!this.#base_permission.NotUser) this.#base_permission.NotUser = [];
		if (!this.#base_permission.HasRole) this.#base_permission.HasRole = [];
		if (!this.#base_permission.IsUser) this.#base_permission.IsUser = [];

		// Check toggle
		// TODO: Implement the togglestatus
		// if (!(interaction.member?.permissions as Readonly<PermissionsBitField>)?.has(PermissionsBitField.Flags.Administrator)) {
		//     return {
		//         success: false,
		//         content: 'This command was disabled by an administrator.',
		//         ephemeral: true
		//     }
		// }

		for (const user of this.#base_permission.NotUser) {
			if (interaction.user.id === user) {
				return {
					success: false,
					content: "You are not allowed to run this command."
				};
			}
		}
		for (const role of this.#base_permission.NotRole) {
			if (interaction.member.roles.cache.has(role)) {
				return {
					success: false,
					content: "You are not allowed to run this command."
				};
			}
		}

		for (const role of this.#base_permission.HasRole) {
			if (interaction.member.roles.cache.has(role)) {
				return {
					success: true
				};
			}
		}
		for (const user of this.#base_permission.IsUser) {
			if (interaction.user.id === user) {
				return {
					success: true
				};
			}
		}
		// Check base permissions
		switch (this.#base_permission.Level) {
			case PermissionLevel.JuniorModerator:
				if (interaction.member.guild.roles.cache.find((r: Role) => r.name.toLowerCase() === "junior moderator")?.position! > interaction.member.guild.roles.highest.position) {
					return {
						success: false,
						content: "You must be Assistant Moderator and up to use this command."
					};
				}
				break;
			case PermissionLevel.Moderator:
				if (!interaction.member.roles.cache.find((r: Role) => r.name.toLowerCase() === "moderator")) {
					return {
						success: false,
						content: "You must be Moderator and up to use this command."
					};
				}
				break;
			case PermissionLevel.Administrator:
				if (!interaction.member.roles.cache.find((r: Role) => r.name.toLowerCase() === "administrator")) {
					return {
						success: false,
						content: "You must be Administrator and up to use this command."
					};
				}
				break;
			case PermissionLevel.Developer:
				let response = false;
				for (const dev of config.devs) {
					if (dev === interaction.user.id) {
						response = true;
						break;
					}
				}
				if (response == false) {
					return {
						success: false,
						content: "You must be a Dorg developer to use this command."
					};
				}
				break;
			default:
				return {
					success: true
				};
		}

		// if (!this.#base_permission(interaction)) {
		//     return {
		//         success: false,
		//         content: "You aren't authorized to use this command."
		//     }
		// }

		// Success
		return {
			success: true
		};
	}

	/** Runs the current {@link Executor}. */
	execute(interaction: ChatInputCommandInteraction): Promise<unknown> {
		return promisify(this.#executor)(interaction);
	}
}
