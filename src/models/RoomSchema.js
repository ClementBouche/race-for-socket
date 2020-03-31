const mongoose = require('mongoose');

const roomSchema = mongoose.Schema(
  {
    name: String,
    maxPlayers: Number,
    users: [String],
    gameName: String,
    game: {
      name: String,
      coverImage: String,
      players: [mongoose.Schema.Types.Mixed],
      reserve: mongoose.Schema.Types.Mixed,
      properties: [mongoose.Schema.Types.Mixed]
    }
  },
  {
    timestamps: true
  }
);

const Room = mongoose.model('Room', roomSchema);
module.exports = Room;
