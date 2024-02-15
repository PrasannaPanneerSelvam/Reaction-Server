const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  systemId: { type: String, unique: true },
  reactions: { type: Map, of: Array, default: {} },
});

const User = mongoose.model("User", UserSchema);

export default User;
