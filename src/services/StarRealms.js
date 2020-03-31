'use strict';

const CardManager = require('./CardManager');
const RoomManager = require('./RoomManager');

const data = require('../data/StarGame');

const colors = [
  'pink',
  'red',
  'blue',
  'green'
];

exports.create = function() {
  const copy = Array
      .from(data.cards);
  CardManager.shuffle(copy);

  return {
    name: 'star-realms',
    players: [],
    coverImage: data.coverImage,
    reserve: {
      draw: copy,
      market: copy.splice(0, 5),
      discard: [],
      explorers: data.explorers
    },
    properties: data.properties
  };
}


exports.addPlayer = function(room, username) {
  const pickedColor = room.game.players.map(p => p.color);
  const color = colors.find((c) => pickedColor.findIndex(pc => pc === c) === -1);
  const player = data.players.find((p) => p.color === color);
  if (!player) {
    console.log('partie complète');
    return;
  }
  player.username = username;
  CardManager.shuffle(player.draw);
  player.hand = player.draw.splice(0, 3);
  room.game.players.push(player);
}

exports.doAction = function(room, msg) {
  console.log('starrealms - do action', msg);
  if (
    msg.target.includes('opponent') ||
    msg.from === 'reserve_discard' ||
    msg.from === 'reserve_draw' && msg.target.includes('player') ||
    false
  ) {
    console.log('mvt interdit');
    return;
  }
  if (!(
    msg.from === 'reserve_explorers' && msg.target === 'player_discard'  ||
    msg.from === 'reserve_market'    && msg.target === 'player_discard'  ||
    msg.from === 'reserve_market'    && msg.target === 'reserve_discard' ||
    msg.from === 'reserve_draw'      && msg.target === 'reserve_market'  ||
    msg.from === 'player_discard'    && msg.target === 'reserve_discard' ||
    msg.from === 'player_hand'       && msg.target === 'reserve_discard' ||
    msg.from === 'player_hand'       && msg.target === 'player_plateau'  ||
    msg.from === 'player_hand'       && msg.target === 'player_discard'  ||
    msg.from === 'player_plateau'    && msg.target === 'player_discard'  ||
    msg.from === 'player_plateau'    && msg.target === 'reserve_discard' ||
    msg.from === 'player_draw'       && msg.target === 'player_hand'     ||
    false
  )) {
    console.log('mvt non prévu');
    return;
  }
  const player = RoomManager.getPlayer(room, msg.username);
  let card;
  if (msg.from === 'reserve_explorers') {
    card = CardManager.splice(room.game.reserve.explorers, msg.cardid);
  }
  if (msg.from === 'reserve_draw') {
    card = CardManager.splice(room.game.reserve.draw, msg.cardid);
  }
  if (msg.from === 'reserve_market') {
    card = CardManager.splice(room.game.reserve.market, msg.cardid);
  }
  if (msg.from === 'player_draw') {
    card = CardManager.splice(player.draw, msg.cardid);
  }
  if (msg.from === 'player_hand') {
    card = CardManager.splice(player.hand, msg.cardid);
  }
  if (msg.from === 'player_plateau') {
    card = CardManager.splice(player.plateau, msg.cardid);
  }
  if (msg.from === 'player_discard') {
    card = CardManager.splice(player.discard, msg.cardid);
  }
  if (card === null) {
    console.log('aucune carte / mvt non prévu');
    return;
  }
  if (msg.target === 'reserve_market') {
    CardManager.add(room.game.reserve.market, card);
  }
  if (msg.target === 'reserve_discard') {
    CardManager.add(room.game.reserve.discard, card);
  }
  if (msg.target === 'player_hand') {
    CardManager.add(player.hand, card);
  }
  if (msg.target === 'player_plateau') {
    CardManager.add(player.plateau, card);
  }
  if (msg.target === 'player_discard') {
    CardManager.add(player.discard, card);
  }
  // renew draw
  if (room.game.reserve.draw.length === 0) {
    CardManager.renewDraw(room.game.reserve.draw, room.game.reserve.discard);
  }
  if (player.draw.length === 0) {
    CardManager.renewDraw(player.draw, player.discard);
  }
}
