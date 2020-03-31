'use strict';

exports.getPlayer = function(__room__, username) {
  return __room__.game.players.find((pl) => pl.username === username);
}
