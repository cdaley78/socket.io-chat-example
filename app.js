var express = require('express')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)

const EMIT = {
  CHAT_MESSAGE: 'chat message',
  USER_CONNECT: 'user connect',
  USER_DISCONNECT: 'user disconnect',
  USER_EXISTS: 'user exists',
  USER_LIST: 'user list',
  USER_SUCCESS: 'user success'
}

const EVENT = {
  CONNECT: 'connection',
  LOGIN: 'user login',
  DISCONNECT: 'disconnect',
  MESSAGE: 'chat message'
}

app.get('/', function(req, res) {
  res.sendFile(__dirname + '/chat.htm')
  app.use(express.static(__dirname))
})

http.listen(3000, function() {
  console.log('listening on *:3000')
})

// user memoization
function userExists(user) {
  if(!userExists.users) userExists.users = {}
  if(userExists.users[user] != undefined) {
    return true
  }
  userExists.users[user] = user
  return false
}

// remove user from storage
function userLeave(user) {
  userExists.users[user] = undefined
}

io.on(EVENT.CONNECT, function(socket) {
  socket.on(EVENT.LOGIN, function(user) {
    if(userExists(user)) {
      socket.emit(EMIT.USER_EXISTS, user)
      return
    }
    socket.user = user
    socket.emit(EMIT.USER_SUCCESS, user) // login successful, show interface
    socket.broadcast.emit(EMIT.USER_CONNECT, user) // alert others user has connected
    io.emit(EMIT.USER_LIST, userExists.users) // update user list
  })
  socket.on(EVENT.DISCONNECT, function() {
    if(socket.user) {
      socket.broadcast.emit(EMIT.USER_DISCONNECT, socket.user)
      userLeave(socket.user)
      io.emit(EMIT.USER_LIST, userExists.users)
    }
  })
  socket.on(EVENT.MESSAGE, function(data) {
    io.emit(EMIT.CHAT_MESSAGE, {
      user: socket.user,
      msg: data
    })
  })
})