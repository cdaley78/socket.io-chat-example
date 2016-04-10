$(function() {
  var socket = io()
  var connected = false

  function addLine(line) {
    var msgContainer = $('.message-container')[0]
    $('#messages').append($('<li>').html(line))
    msgContainer.scrollTop = msgContainer.scrollHeight
  }
  function validUserName(val) {
    var v = val.toLowerCase()
    if(v === 'easter') {
      return false
    }
    return true
  }
  $('#uform').submit(function(e) {
    var val = $('#un').val()
    var instr = $('.u-form > p')
    if(val === '') {
      instr.text('Please enter something real:')
    }
    else if(!validUserName(val)) {
      instr.text('The name you entered is not valid. Sorry that doesn\'t help. Try again.')
      $('#un').select()
    }
    else {
      socket.emit('user login', val)
    }
    e.preventDefault()
  })
  $('#chat').submit(function() {
    var msg = $('#m')
    if (msg.val() !== '') { 
      socket.emit('chat message', msg.val())
    }
    msg.val('')

    return false
  })
  socket.on('user success', function(user) {
    var msgInput = $('#m')
    $('.user-input').hide()
    msgInput.prop('disabled', false)
    msgInput.focus()
    addLine('Hello ' + user + '.')
    connected = true
  })
  socket.on('user connect', function(user) {
    if(connected) {
      addLine(user + ' has entered!')
    }
  })
  socket.on('user exists', function(user) {
    $('.u-form > p').text(user + ' is already connected. Use a different name.')
    $('#un').select()
  })
  socket.on('chat message', function(data) {
    if(connected) {
      addLine("<span class='msg-header'>" + data.user + ":</span> " + data.msg)
    }
  })
  socket.on('user disconnect', function(user) {
    if(connected) {
      addLine(user + ' has left.')
    }
  })
  socket.on('user list', function(users) {
    var list = $('.users-online')
    list.find('p').not(':first').remove()
    Object.keys(users).forEach(function(v) {
      list.append('<p>' + v + '</p>')
    })
  })
})