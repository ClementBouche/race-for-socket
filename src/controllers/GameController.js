'use strict';

const DATABASE = require('../database');

exports.new = function(room, username) {
  const copy = Array.from(DATABASE);
  shuffle(copy);

  const starts = [pickStart(copy), pickStart(copy)];

  return {
    name: room,
    players: [{
      username: username,
      plateau: [starts[0]],
      hand: copy.splice(0, 6),
      vp: 0
    }, {
      username: '',
      plateau: [starts[1]],
      hand: copy.splice(0, 6),
      vp: 0
    }],
    draw: copy,
    stock: {
      vp: 24
    },
    discard: []
  };
}

const shuffle = function(array__) {
  for (let i = array__.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array__[i], array__[j]] = [array__[j], array__[i]];
  }
}

const pickStart = function(deck) {
  const index = deck.findIndex(item => item.start);
  return deck.splice(index, 1);
}
