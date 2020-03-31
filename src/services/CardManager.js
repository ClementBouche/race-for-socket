'use strict';

const shuffle = function(__array__) {
  for (let i = __array__.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [__array__[i], __array__[j]] = [__array__[j], __array__[i]];
  }
};

exports.shuffle = shuffle;

exports.pickStart = function(deck) {
  const index = deck.findIndex(item => item.start);
  return deck.splice(index, 1)[0];
}

exports.splice = function(__array__, __id__) {
  const index = __array__.findIndex((item) => item.id === __id__);
  if (index === -1) {
    return null;
  }
  return __array__.splice(index, 1)[0];
}

exports.add = function(__array__, __item__) {
  __array__.push(__item__);
}

exports.renewDraw = function(__empty__, __full__) {
  Array.prototype.push.apply(__empty__, __full__.splice(0, __full__.length));
  shuffle(__empty__);
}
