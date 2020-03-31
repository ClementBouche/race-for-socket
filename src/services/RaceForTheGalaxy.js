'use strict';

const CardManager = require('./CardManager');
const RoomManager = require('./RoomManager');

const data = require('../data/RaceForGame');

const colors = [
  'pink',
  'red',
  'blue',
  'green'
];

exports.create = function() {
  const copy = Array
      .from(data)
      .filter((card) => {
        return !(card.hasOwnProperty('color') && card.color);
      });
  CardManager.shuffle(copy);

  return {
    name: 'race-for-the-galaxy',
    players: [],
    coverImage: '/assets/rftg/cover-card.jpg',
    reserve: {
      draw: copy,
      discard: [],
      vp: 24
    },
    properties: []
  };
}


exports.addPlayer = function(room, username) {
  const pickedColor = room.game.players.map(p => p.color);
  const color = colors.find((c) => pickedColor.findIndex(pc => pc === c) === -1);
  // const draw = room.game.reserve.draw;
  const player = {
    username: username,
    plateau: [CardManager.pickStart(room.game.reserve.draw)],
    hand: room.game.reserve.draw.splice(0, 6),
    color: color,
    vp: 0
  };
  room.game.players.push(player);
}

exports.doAction = function(room, msg) {
  console.log('raceforthegalaxy - do action', msg);
  if (
    msg.target.includes('opponent') ||
    msg.from.includes('discard') ||
    msg.from.includes('plateau') ||
    msg.from === 'reserve_draw' && msg.target.includes('plateau')
  ) {
    console.log('mvt interdit');
    return;
  }
  if (!(
    msg.from === 'reserve_draw' && msg.target === 'player_hand' ||
    msg.from === 'reserve_draw' && msg.target === 'reserve_discard' ||
    msg.from === 'player_hand' && msg.target === 'reserve_discard' ||
    msg.from === 'player_hand' && msg.target === 'player_plateau'
  )) {
    console.log('mvt non prévu');
    return;
  }
  const player = RoomManager.getPlayer(room, msg.username);
  let card;
  if (msg.from === 'reserve_draw') {
    card = CardManager.splice(room.game.reserve.draw, msg.cardid);
  }
  if (msg.from === 'player_hand') {
    card = CardManager.splice(player.hand, msg.cardid);
  }
  if (card === null) {
    console.log('mvt non prévu');
    return;
  }
  if (msg.target === 'player_hand') {
    CardManager.add(player.hand, card);
  }
  if (msg.target === 'reserve_discard') {
    CardManager.add(room.game.reserve.discard, card);
  }
  if (msg.target === 'player_plateau') {
    CardManager.add(player.plateau, card);
  }
  if (room.game.reserve.draw.length === 0) {
    CardManager.renewDraw(room.game.reserve.draw, room.game.reserve.discard);
  }
}
