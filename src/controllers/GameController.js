'use strict';

// const RaceForGame = require('../data/games');
const RaceForGame = require('../data/RaceForGame');
const StarRealmsService = require('../services/StarRealms');
const RaceForGalaxyService = require('../services/RaceForTheGalaxy');


exports.create = function(game) {
  switch (game) {
    case 'race-for-the-galaxy':
      return RaceForGalaxyService.create();
    case 'star-realms':
      return StarRealmsService.create();
    default:
      break;
  }
  // default game
  return RaceForGalaxyService.create();
}


exports.addPlayer = function(room, username) {
  room.users.push(username);
  switch (room.game.name) {
    case 'race-for-the-galaxy':
      return RaceForGalaxyService.addPlayer(room, username);
    case 'star-realms':
      return StarRealmsService.addPlayer(room, username);
    default:
      break;
  }
  // default
  return RaceForGalaxyService.addPlayer(room, username);
}


exports.getPlayer = function(room, username) {
  return room.game.players.find(us => us.username === username);
}


exports.doAction = function(room, msg) {
  switch (room.game.name) {
    case 'race-for-the-galaxy':
      return RaceForGalaxyService.doAction(room, msg);
    case 'star-realms':
      return StarRealmsService.doAction(room, msg);
    default:
      break;
  }
  // default
  return RaceForGalaxyService.doAction(room, msg);
}







//// old soupe

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

