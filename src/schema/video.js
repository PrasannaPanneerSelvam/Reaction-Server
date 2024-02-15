const mongoose = require("mongoose");

const VideoReactionSchema = new mongoose.Schema({
  videoId: { type: String, unique: true },
  reactions: { type: Map, of: Number, default: {} },
});

const VideoEntry = mongoose.model("VideoReaction", VideoReactionSchema);

export default VideoEntry;
