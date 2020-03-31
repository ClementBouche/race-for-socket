'use strict';

const GameController = require('./GameController');

const Room = require('../models/RoomSchema');
const RoomSamples = require('../data/RoomSamples');

// msg.room
// msg.username
// msg...

const listProjection = {
  name: 1,
  maxPlayers: 1,
  users: 1,
  gameName: 1,
  createdAt: 1,
  updatedAt: 1
}

exports.create = function(msg) {
  // read msg
  const username = msg.username;
  const gameName = msg.game;
  // create room
  const name = `${randomRoom()} de ${username}`;
  const game = GameController.create(gameName);
  const newMessage = new Room({
    name: name,
    maxPlayers: 99,
    users: [msg.username],
    gameName: gameName,
    game: game
  });
  return newMessage.save();
}


exports.read = function(msg) {
  return Room.findOne({
      $or: { name: msg.room, _id: msg.room }
    }).exec();
}


exports.update = function(msg) {
  return Room.updateOne({
    $or: { name: msg.room, _id: msg.room }
    }, msg).exec();
}


exports.delete = function(msg) {
  return Room.deleteOne({
    $or: { name: msg.room, _id: msg.room }
    }).exec();
}


exports.list = function(msg) {
  return Room.find({}, listProjection).exec();
}


exports.deleteAll = function(msg) {
  return Room.deleteMany({}).exec();
}


exports.join = function(msg) {
  const username = msg.username;
  return Room.findOne({
        $or: [{ name: msg.room }, { _id: msg.room }],
      }).then((room) => {
        const player = GameController.getPlayer(room, username);
        if (player) {
          // user already in game
        } else {
          GameController.addPlayer(room, username);
        }
        room.markModified('game');
        return room.save().then((saved) => saved);
      });
}

exports.doAction = function(msg) {
  return Room.findOne({
        $or: [{ name: msg.room }, { _id: msg.room }],
      }).then((room) => {
        GameController.doAction(room, msg);
        room.markModified('game');
        return room.save().then((saved) => saved);
      });
}

const randomRoom = function() {
  const index = Math.floor(Math.random() * RoomSamples.length);
  return RoomSamples[index];
}
