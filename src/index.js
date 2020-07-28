const express = require('express');
const http = require('http')
const chalk = require('chalk');
const path = require('path');
const { generateMessage, generateLocationMessage } = require('../utlis/messages')
const socketio = require('socket.io');
const Filter = require('bad-words');

const app = express();
const server = http.createServer(app);
const io = socketio(server);


const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

let count = 0;
let message = 'Welcome';

io.on('connection', (socket) => {
     console.log('New websocket connection')


     socket.on('join', ({ username, room }) => {
          socket.join(room)
          socket.emit('message', generateMessage('Welcome!'))
          socket.broadcast.to(room).emit('message', generateMessage(`${username} has joined!`))
     })

     socket.on('sendMessage', (message, callback) => {
          const filter = new Filter()

          if (filter.isProfane(message)) {
               return callback('Profanity is not allowed!');
          }

          io.emit('message', generateMessage(message));
          callback('delivered')
     })

     socket.on('disconnect', () => {
          io.emit('message', generateMessage('A user has disconneted'));
     })

     socket.on('sendLocation', (coords, callback) => {
          io.emit('locationMessage', generateLocationMessage(`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
          callback();
     })
})

server.listen(port, () => {
     console.log(chalk.cyanBright.inverse.bold(`listening on port ${port}`))
})