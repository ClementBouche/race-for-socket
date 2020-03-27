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
const RoomController = require('./controllers/RoomController');

// GAMES type
// {
    // name: room,
    //   players: [{
//     plateau: [starts[0]],
//     hand: copy.splice(0, 6),
//     vp: 0
//   }],
//   draw: copy,
//   stock: {
//     vp: 24
//   },
//   discard: []
// };
let GAMES = [];

// tableau de string
let ROOMS = [];

io.on('connection', (socket) => {

  console.log('user connected');
  socket.emit('rooms', ROOMS);


  socket.on('disconnect', () => {
    console.log('user disconnected');
  });


  socket.on('create', (msg) => {
    RoomController.create(ROOMS, msg);

    socket.emit('rooms', ROOMS);
  });


  // msg.username msg.room
  socket.on('join', (msg) => {
    console.log(msg);
    const room = msg.room;
    const username = msg.username;
    // go to new room
    socket.join(room);
    if (GAMES.hasOwnProperty(room) && GAMES[room] !== null) {
      // player 2 join
      if (username !== GAMES[room].players[0].username) {
        GAMES[room].players[1].username = username;
      }
    } else {
      // player 1 join && create new game
      GAMES[room] = GameController.new(room, username);
    }
    // send all message for that room
    io.in(room).emit('room_state', GAMES[room]);
  });


  socket.on('leave', msg => {
    GameController.delete(GAMES, msg);
    RoomController.delete(ROOMS, msg);

    socket.emit('rooms', ROOMS);
  });


  socket.on('leave_all', msg => {
    console.log('leaveall', msg);
    GameController.removeAll(GAMES, msg);
    RoomController.removeAll(ROOMS, msg);

    socket.emit('rooms', ROOMS);
  });


  // draw message
  // room & player && card
  socket.on('draw', msg => {
    console.log(msg);
    const room = msg.room;
    const username = msg.username;

    GameController.draw(GAMES[room], msg.username, msg.cardid);

    // send all message for that room
    io.in(room).emit('room_state', GAMES[room]);
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

    io.in(room).emit('room_state', GAMES[room]);
  });


  // play message
  // room & player && card
  socket.on('play', msg => {
    console.log(msg);
    const room = msg.room;
    const username = msg.username;

    GameController.play(GAMES[room], msg.username, msg.cardid);

    socket.to(room).emit('room_state', GAMES[room]);
  });


  socket.on('move', msg => {
    console.log(msg);

    socket.to(msg.room).emit('mouse_moved', msg);
  });


});

const port = 4040;

http.listen(port, () => {
  console.log('Socket running on ' + port);
});
