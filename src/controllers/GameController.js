'use strict';

const DATABASE = require('../database');

exports.new = function(room, username) {
  const copy = Array.from(DATABASE);
  shuffle(copy);

  return {
    name: room,
    players: [{
        username: username,
        plateau: [pickStart(copy)],
        hand: copy.splice(0, 6),
        vp: 0
      }, {
        username: '',
        plateau: [pickStart(copy)],
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

exports.draw = function(game, username, cardid) {
  const index = game.draw.findIndex(i => i.id === cardid);
  if (index === -1) {
    return;
  }
  const card = game.draw.splice(index, 1)[0];
  const indexUser = game.players.findIndex(p => p.username === username);
  if (indexUser === -1) {
    return;
  }
  game.players[indexUser].hand.push(card);
}

exports.discard = function(game, username, cardid) {

  // from pile
  {
    const index = game.draw.findIndex(i => i.id === cardid);
    if (index !== -1) {
      const card = game.draw.splice(index, 1)[0];
      game.discard.push(card);
    }
  }

  // from hand
  {
    const indexUser = game.players.findIndex(p => p.username === username);
    if (indexUser === -1) {
      return;
    }
    const index = game.players[indexUser].hand.findIndex(i => i.id === cardid);
    if (index !== -1) {
      const card = game.players[indexUser].hand.splice(index, 1)[0];
      game.discard.push(card);
    }
  }

}

exports.play = function(game, username, cardid) {
  const indexUser = game.players.findIndex(p => p.username === username);
  if (indexUser === -1) {
    return;
  }
  const index = game.players[indexUser].hand.findIndex(i => i.id === cardid);
  if (index === -1) {
    return;
  }
  const card = game.players[indexUser].hand.splice(index, 1)[0];
  game.players[indexUser].plateau.push(card);

}


const shuffle = function(array__) {
  for (let i = array__.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array__[i], array__[j]] = [array__[j], array__[i]];
  }
}

const pickStart = function(deck) {
  const index = deck.findIndex(item => item.start);
  return deck.splice(index, 1)[0];
}
