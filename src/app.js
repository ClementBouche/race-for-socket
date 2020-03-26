// require express module
const app = require('express')();

// require the http module
const http = require('http').Server(app);

// require the socket.io module
const io = require('socket.io')(http, {
  handlePreflightRequest: (req, res) => {
      const headers = {
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
          "Access-Control-Allow-Origin": req.headers.origin, //or the specific origin you want to give access to,
          "Access-Control-Allow-Credentials": true
      };
      res.writeHead(200, headers);
      res.end();
  }
});

// database connection
const GameController = require('./controllers/GameController');
const DATABASE = require('./database');

// GAMES type
// {
    // name: room,
    //   p1: {
//     plateau: [starts[0]],
//     hand: copy.splice(0, 6),
//     vp: 0
//   },
//   p2: {
//     plateau: [starts[1]],
//     hand: copy.splice(0, 6),
//     vp: 0
//   },
//   draw: copy,
//   stock: {
//     vp: 24
//   },
//   discard: []
// };
let GAMES = [];

io.on('connection', (socket) => {

  console.log('user connected');

  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  // msg.username msg.room
  socket.on('join', (msg) => {
    console.log(msg);
    const room = msg.room;
    const username = msg.username;
    // go to new room
    socket.join(room);
    if (!GAMES.hasOwnProperty(room)) {
      // player 1 join && create new game
      GAMES[room] = GameController.new(room, username);
    } else {
      // player 2 join
      if (username !== GAMES[room].players[0].username) {
        GAMES[room].players[1].username = username;
      }
    }
    // send all message for that room
    io.in(room).emit('room_state', GAMES[room]);
  });

  socket.on('leave', msg => {
    console.log(msg);
    const room = msg.room;
    const username = msg.username;
    GAMES = [];
    console.log(GAMES);
  });

  // draw message
  // room & player && card
  socket.on('draw', msg => {
    console.log(msg);
    const room = msg.room;
    const username = msg.username;

    GameController.draw(GAMES[room], msg.username, msg.cardid);

    // send all message for that room
    socket.to(room).emit('room_state', GAMES[room]);
    // MessageController.save(msg).then((newMessage) => {
    //   // socket.emit('message', newMessage);
    //   // socket.to(newMessage.room).emit('message', newMessage);
    //   io.in(newMessage.room).emit('message', newMessage);
    // });
  });

  // discard message
  // room & player && card
  socket.on('discard', msg => {
    console.log(msg);
    const room = msg.room;
    const username = msg.username;

    GameController.discard(GAMES[room], msg.username, msg.cardid);

    socket.to(room).emit('room_state', GAMES[room]);
    // MessageController.update(msg).then((newMessage) => {
    //   socket.to(newMessage.room).emit('messageUpdated', newMessage);
    // });
  });

  // play message
  // room & player && card
  socket.on('play', msg => {
    console.log(msg);
    const room = msg.room;
    const username = msg.username;

    GameController.play(GAMES[room], msg.username, msg.cardid);

    socket.to(room).emit('room_state', GAMES[room]);
    // MessageController.delete(msg).then(() => {
    //   io.in(msg.room).emit('messageDeleted', msg);
    // });
  });

});

const port = 4040;

http.listen(port, () => {
  console.log('Socket running on ' + port);
});
