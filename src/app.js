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

const connect = require('./dbconnection');

// database connection
const RoomController = require('./controllers/RoomController');


io.on('connection', (socket) => {


  // USER ROUTER
  console.log('user connected');
  RoomController.list().then((rooms) => {
    console.log('rooms', rooms);
    socket.emit('rooms', rooms);
  });


  socket.on('disconnect', () => {
    console.log('user disconnected');
  });


  // ROOM ROUTER
  socket.on('create', (msg) => {
    console.log(msg);

    RoomController.create(msg)
      .then(() => RoomController.list())
      .then((rooms) => {
        socket.emit('rooms', rooms);
      });
  });


  socket.on('join', (msg) => {
    console.log(msg);

    const idRoom = msg.room;
    console.log('user',  msg.username, 'join room', idRoom);
    // go to new room
    socket.join(idRoom);

    RoomController.join(msg)
      .then((room) => {
        io.in(idRoom).emit('room_state', room);
        // emit rooms update to other
        RoomController.list().then((rooms) => {
          socket.broadcast.emit('rooms', rooms);
        });
      });
  });


  socket.on('delete', msg => {
    console.log('delete', msg);
    RoomController.delete(msg)
      .then(() => RoomController.list())
      .then((rooms) => {
        socket.emit('rooms', rooms);
      });
  });


  socket.on('delete_all', msg => {
    console.log('delete_all', msg);

    RoomController.deleteAll(msg)
      .then(() => RoomController.list())
      .then((rooms) => {
        socket.emit('rooms', rooms);
      });
  });


  // GAME ROUTER
  socket.on('game_action', msg => {
    // console.log(msg);
    const idRoom = msg.room;

    RoomController.doAction(msg)
      .then((room) => {
        io.in(idRoom).emit('room_state', room);
      });

    // send message for that room
    // io.in(idRoom).emit('room_state', room);
    // send message for that room except sender
    // io.to(idRoom).emit('room_state', room);
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
