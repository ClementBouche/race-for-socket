'use strict';

const ROOM_TEMPLATE = require('../data/rooms');

exports.create = function(rooms, msg) {
  console.log(msg);

  const username = msg.username;

  const roomname = `${randomRoom()} de ${username}`;

  rooms.push(roomname);
}


exports.remove = function(rooms, msg) {
  console.log(msg);
  const room = msg.room;
  const index = rooms.findIndex(r => r === room);
  if (index !== -1) {
    rooms.splice(index, 1);
  }
}


exports.removeAll = function(rooms, msg) {
  console.log(msg);
  rooms.splice(0, rooms.length);
}


// TODO
exports.list = function() {
}


const randomRoom = function() {
  const index = Math.floor(Math.random() * ROOM_TEMPLATE.length);
  return ROOM_TEMPLATE[index];
}
