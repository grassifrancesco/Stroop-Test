const Player = require('./PlayerServer');

const express = require('express');
const app = express();

const http = require('http');
const { SocketAddress } = require('net');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const port = 3000;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

const players = {};
const finishOrder = [];

io.on('connection', (socket) => {
  console.log(`USER ${socket.id} CONNECTED`);

  players[socket.id] = new Player(socket.name);
  io.emit('updatePlayers', players);

  socket.on('disconnect', (reason) => {
    console.log(`USER ${socket.id} DISCONNECTED FOR REASON: ${reason}`);

    const idx = finishOrder.findIndex(e => e.id === socket.id);
    if (idx !== -1) {
      finishOrder.splice(idx, 1);
    }

    delete players[socket.id];
    io.emit('updatePlayers', players);
  });

  socket.on('endGame', (player) => {
    if (!finishOrder.some(e => e.id === socket.id)) {
      finishOrder.push({
        id: socket.id,
        name: player.name,
        correctAnswers: player.correctAnswers,
        responseTimes: player.responseTimes,
        totalTime: player.responseTimes.reduce((a, b) => a + b, 0)
      });
    }

    if (finishOrder.length === Object.keys(players).length) {
      finishOrder.sort((a, b) => a.totalTime - b.totalTime);
      io.emit('finalRanking', finishOrder);
      finishOrder.length = 0;
    }

    if (players[socket.id]) {
      players[socket.id].finito = true;
      players[socket.id].iniziato = false;
      io.emit('updatePlayers', players);
    }
  });

  socket.on('playerReady', () => {
    if (players[socket.id]) {
      players[socket.id].iniziato = true;

      const allReady = Object.values(players).length > 0 && Object.values(players).every(p => p.iniziato);
      if (allReady) {
        io.emit('allReady');
      }
    }
  });

  console.log('CURRENT PLAYERS:', players);
});

server.listen(port, () => {
  console.log(`APPLICATION LISTENING ON PORT: ${port}`);
});
