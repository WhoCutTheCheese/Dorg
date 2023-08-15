import { User } from "discord.js";
import mongoose from "mongoose";

const schema = new mongoose.Schema({
	guildID: String,
	creatorID: String,
	users: Array,
	channelID: String,
	claimedID: String,
	closeReason: String,
	status: Boolean,
});

export default mongoose.model("ticket", schema);