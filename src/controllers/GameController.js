'use strict';

// const GAME_TEMPLATE = require('../data/games');
const GAME_TEMPLATE = require('../data/race-ftg');

exports.new = function(room, username) {
  const copy = Array
      .from(GAME_TEMPLATE)
      .filter((card) => {
        return !(card.hasOwnProperty('color') && card.color);
      });
  shuffle(copy);

  return {
    name: room,
    players: [{
        username: username,
        plateau: [pickStart(copy)],
        hand: copy.splice(0, 6),
        color: 'pink',
        vp: 0
      }, {
        username: '',
        plateau: [pickStart(copy)],
        hand: copy.splice(0, 6),
        color: 'blue',
        vp: 0
    }],
    draw: copy,
    stock: {
      vp: 24
    },
    discard: []
  };
}

exports.remove = function(games, msg) {
  console.log(msg);
  const room = msg.room;
  games[room] = null;
}

exports.removeAll = function(games) {
  games = [];
}

exports.draw = function(game, username, cardid) {
  const index = game.draw.findIndex(i => i.id === cardid);
  if (index === -1) {
    return;
  }
  const card = game.draw.splice(index, 1)[0];
  renewDraw(game);

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
      renewDraw(game);
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

const renewDraw = function(game) {
  // shuffle if draw empty
  if (game.draw.length !== 0) {
    return;
  }
  game.draw = game.discard.splice(0, game.discard.length);
  shuffle(game.draw);
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
