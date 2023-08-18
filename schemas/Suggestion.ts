import mongoose from "mongoose";

const schema = new mongoose.Schema({
	guildID: String,
	creatorID: String,
	suggestionID: Number,
	messageID: String,
	channelID: String,
});

export default mongoose.model("suggestion", schema);