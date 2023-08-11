import mongoose from "mongoose";

const schema = new mongoose.Schema({
	guildID: String,
	userID: String,
    modID: String,
    caseNumber: Number,
    caseType: String,
    reason: String,
    duration: String,
    dateIssued: String,
});

export default mongoose.model("case", schema);