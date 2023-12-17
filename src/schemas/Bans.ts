import mongoose from "mongoose";

const schema = new mongoose.Schema({
	guildID: String,
	userID: String,
	caseNumber: Number,
	endDate: Number
});

export default mongoose.model("ban", schema);