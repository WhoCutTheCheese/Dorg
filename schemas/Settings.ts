import mongoose from "mongoose";

const schema = new mongoose.Schema({
	guildID: String,
	juniorMod: String,
	mod: String,
	assistantAdmin: String,
	admin: String,
	mediaBanned: String,
	helpBanned: String,
	modLogChannel: String,
	suggestionChannel: String,
});

export default mongoose.model("settings", schema);