import { APIEmbedField, APIMessageComponentEmoji, ActionRowBuilder, Attachment, AttachmentBuilder, BaseMessageOptions, BufferResolvable, ButtonBuilder, ButtonStyle, ColorResolvable, EmbedAuthorOptions, EmbedBuilder, InteractionReplyOptions, RestOrArray } from "discord.js";

interface EmbedOptions {
	type: EmbedType,
	color?: ColorResolvable,
	title?: string,
	author?: EmbedAuthorOptions,
	description?: string,
	fields?: APIEmbedField[],
	image?: string,
	thumbnail?: string,
	footer?: { text?: string, icon?: string, timestamp?: boolean; };
}

interface ButtonOptions {
	label: string,
	customID?: string,
	emoji?: APIMessageComponentEmoji,
	style: ButtonStyle,
	url?: string,
	disabled?: boolean;
}

interface AttachmentOptions {
	attachment: BufferResolvable,
	name?: string,
	description?: string,
}

export enum EmbedType {
	Custom,
	Normal,
	Warning,
	Error,
	Success,
}

export class MessageResponse {
	#embeds: EmbedBuilder[] | undefined;
	#buttons: ActionRowBuilder<ButtonBuilder>[] | undefined;
	#content: string | undefined;
	#attachments: Attachment[] | AttachmentBuilder[] | undefined;
	#ephemeral: boolean;
	#fetchReply: boolean;

	constructor() {
		this.#attachments = undefined;
		this.#buttons = undefined;
		this.#content = undefined;
		this.#embeds = undefined;
		this.#ephemeral = false;
		this.#fetchReply = false;
	}

	setContent(content: string): this {
		this.#content = content;
		return this;
	}

	setEphemeral(bool: boolean): this {
		this.#ephemeral = bool;
		return this;
	}

	fetchReply(bool: boolean): this {
		this.#fetchReply = bool;
		return this;
	}

	addEmbeds(embeds: EmbedOptions[]): this {
		this.#embeds = [];
		for (const bed of embeds) {
			const { type, color, title, author, description, fields, image, thumbnail, footer } = bed;
			const newBed = new EmbedBuilder()
				.setTitle(title || null)
				.setAuthor(author || null)
				.setDescription(description || null)
				.setThumbnail(thumbnail || null)
				.setImage(image || null);
			if (fields) {
				newBed.addFields(fields);
			}
			if (footer) {
				if (footer.text) {
					if (footer.icon) {
						newBed.setFooter({ text: footer?.text, iconURL: footer.icon });
					}
					newBed.setFooter({ text: footer?.text });
				}
				if (footer.timestamp == true) {
					newBed.setTimestamp();
				}
			}
			if (type == 0) {
				if (!color) throw new Error("Invalid color provided, type set as custom.");
				newBed.setColor(color);
			} else if (type == 1) {
				newBed.setColor("Blurple");
			} else if (type == 2) {
				newBed.setColor("Yellow");
			} else if (type == 3) {
				newBed.setColor("Red");
			} else if (type == 4) {
				newBed.setColor("Green");
			}
			this.#embeds.push(newBed);
		}
		return this;
	}

	addButtons(buttons: ButtonOptions[]): this {
		this.#buttons = [];
		const row = new ActionRowBuilder<ButtonBuilder>();
		for (const button of buttons) {
			const { customID, label, url, style, emoji, disabled } = button;
			const newButton = new ButtonBuilder()
				.setLabel(label)
				.setStyle(style);
			if (disabled !== undefined) {
				newButton.setDisabled(disabled);
			} else {
				newButton.setDisabled(false);
			}
			if (customID) {
				newButton.setCustomId(customID);
			}
			if (url) {
				newButton.setURL(url);
			}
			if (emoji) {
				newButton.setEmoji(emoji);
			}
			row.addComponents(newButton);
		}
		this.#buttons.push(row);
		return this;
	}

	addAttachments(attachments: AttachmentOptions[]): this {
		this.#attachments = [];
		for (const singleAttachment of attachments) {
			const { attachment, name, description } = singleAttachment;
		}
		return this;
	}

	build(): BaseMessageOptions | InteractionReplyOptions {
		if (!this.#embeds && !this.#buttons && !this.#content && !this.#attachments) {
			throw new Error("Improper setup of MessageResponse class.");
		}
		if (this.#ephemeral || this.#fetchReply) {
			return { content: this.#content, embeds: this.#embeds, components: this.#buttons, files: this.#attachments, ephemeral: this.#ephemeral, fetchReply: this.#fetchReply };
		}
		return { content: this.#content, embeds: this.#embeds, components: this.#buttons, files: this.#attachments } as BaseMessageOptions;
	}

}