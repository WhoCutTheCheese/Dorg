import mongoose from "mongoose";

const schema = new mongoose.Schema({
	guildID: String,
	userID: String,
	endDate: Number
});

export default mongoose.model("bans", schema);