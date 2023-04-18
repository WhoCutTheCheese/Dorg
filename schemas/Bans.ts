import mongoose from "mongoose";

const schema = new mongoose.Schema({
	guildID: String,
	userID: String,
	endDate: Date
});

export default mongoose.model("bans", schema);