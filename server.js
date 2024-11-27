const express = require('express')
const app = express()
const http = require('http')
const socketIo = require('socket.io')

app.use(express.static('public'))
app.get('/', (req, res) => {
  return res.render('index.ejs')
})

const server = http.createServer(app).listen(8000, () => {
  console.log('http://localhost:8000')
})
const io = socketIo(server)
io.on('connection', (socket) => {
  console.log('socket connected')
  socket.on('create room', (room) => {
    var clientsInRoom = io.sockets.adapter.rooms[room];
    var numClients = clientsInRoom ? Object.keys(clientsInRoom).length : 0;
    if (numClients === 0) {
      socket.join(room)
      socket.emit('created', room)
    } else if (numClients === 1) {
       socket.in(room).emit('join',room)
       socket.join(room)
       socket.in(room).emit('joined',room)
    }
  })
  socket.on('answer',(room)=>{
    console.log('answer',room)
    socket.in(room).emit('ans',room)
  })
  socket.on('message', (message, room) => {
    socket.in(room).emit('message', message, room)
  })
})



