const express = require('express')
const app = express()

const http = require('http')
const server = http.createServer(app)
const { Server } = require('socket.io')
const io = new Server(server)

const port = 3000

app.use(express.static('public'))

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html')
})

const players = {

}

io.on('connection', (socket) => {
  console.log('a user connected')
  players[socket.id] = {
    score: 0,
    correct: 0,
    wrong: 0,
    questionCount: 0,
    responseTimes: [],
    finito: false
  }

  io.emit('updatePlayers', players)

  socket.on('disconnect', (reason) => {
    console.log("user disconnected for reason: ${reason}")
    delete players[socket.id]
    io.emit('updatePlayers', players)
  })

  console.log('Current players:', players)
})

server.listen(port, () => {
  console.log('Test app listening on port ${port}')
})
