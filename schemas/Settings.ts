import mongoose from "mongoose";

const schema = new mongoose.Schema({
	guildID: String,
	juniorMod: String,
	mod: String,
	assistantAdmin: String,
	admin: String,
	modLogChannel: String,
});

export default mongoose.model("settings", schema);