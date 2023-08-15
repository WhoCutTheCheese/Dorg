import mongoose from "mongoose";

const schema = new mongoose.Schema({
	guildID: String,
	modLogChannel: String,
	suggestionChannel: String,
	caseCount: Number,
	ticketCount: Number,
	suggestionCount: Number,
});

export default mongoose.model("settings", schema);
