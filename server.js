const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');

const app = express();
const server = http.createServer(app);

const io = socketio(server);
const formatMessage = require('./utils/messages')
const {userJoin,getCurrentUser,userleaves,getroomusers} = require('./utils/users')
//Set Static Folder
app.use(express.static(path.join(__dirname,'public')));
const botname = 'ChatCordBot';
//Run when cleient connects
io.on('connection', socket=>{
  socket.on('joinRoom',({username,room})=>{
const user = userJoin(socket.id, username, room)
    socket.join(user.room)
    //Welcome Current User
    socket.emit('message', formatMessage(botname,'Welcome to Chatcord'))
    //Broadcase when a user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botname,`${user.username} has joined the chat`)); // All clients except this
//
    // Send Users and room info
    io.to(user.room).emit('roomUsers',{room:user.room, users:getroomusers(user
            .room)})
  })

  //Listen for message
  socket.on('chatMessage', (msg)=>{
    const user = getCurrentUser(socket.id);
    console.log(msg);
    io.to(user.room).emit('message',  formatMessage(user.username,msg));
  })
  //A client Disconnect
  socket.on('disconnect', ()=>{
    const user = userleaves(socket.id);
    console.log(user)
    if(user){
      io.to(user.room).emit('message', formatMessage(botname,`${user.username} has left the chat`))

        // Send Users and room info
        io.to(user.room).emit('roomUsers',{room:user.room, users:getroomusers(user.room)})

    }

  })
})
server.listen(process.env.PORT || 3000, ()=>
console.log(`Server Running on Port`, process.env.PORT || 3000)
);