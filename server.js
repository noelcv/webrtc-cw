const express = require('express');
const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);
const { v4: uuidV4 } = require('uuid');

app.set('view engine', 'ejs');
app.use(express.static('public'));


//routing
app.get('/', (req, res) => {
  res.redirect(`/${uuidV4()}`);
})

app.get('/:room', (req, res) => {
  res.render('room', {roomId: req.params.room})
})

//io

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).emit('user-connected', userId);
  
    socket.on('disconnect', () => {
      socket.to(roomId).emit('user-disconnected', userId);
    })
  })
})

const port = process.env.PORT || 9000;
server.listen(port, () =>
  console.log(
    `Server running at https://localhost:${port}`
  )
);
