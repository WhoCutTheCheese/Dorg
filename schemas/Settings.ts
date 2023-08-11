import mongoose from "mongoose";

const schema = new mongoose.Schema({
	guildID: String,
	modLogChannel: String,
	suggestionChannel: String,
	caseCount: Number,
});

export default mongoose.model("settings", schema);