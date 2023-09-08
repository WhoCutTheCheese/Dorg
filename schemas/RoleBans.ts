import mongoose from "mongoose";

const schema = new mongoose.Schema({
	guildID: String,
	userID: String,
	roleID: String,
	type: String,
	caseNumber: Number,
	endDate: Number
});

export default mongoose.model("rolebans", schema);