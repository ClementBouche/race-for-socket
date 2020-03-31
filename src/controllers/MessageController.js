'use strict';

const Message = require('../models/MessageSchema');
const md = require('markdown-it')({
  html: true,
  breaks: true,
});


exports.create = function(msg) {
  const newContent = md.render(msg.content);
  const newMessage = new Message({
    content: newContent,
    room: msg.room,
    sender: msg.sender,
  });
  return newMessage.save();
}


// exports.read = function(msg) {
// }


exports.update = function(msg) {
  return Message.findById(msg.id).exec().then((original) => {
    const newMessage = Object.assign(original, msg);
    return newMessage.save();
  });
}


exports.delete = function(msg) {
  return Message.deleteOne({
    _id: msg.id
  }).exec();
}


exports.list = function(room) {
  return Message.find({
    room: room
  }).exec();
}

