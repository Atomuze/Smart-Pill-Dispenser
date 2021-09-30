import io from "socket.io";
import express, { static } from "express";
var app = express();
app.use(static('www'));


var server = app.listen(5438, function(req, res) {
  console.log("connecting to 5438 port");
});

var sio = io(server);

sio.on('connection', function(socket){
  console.log("Connected");

  //get the messege from arduino
  socket.on('connection', function (data) {
　　console.log('message:' + data.msg);
  });

  //get the time 
  socket.on('atime', function (data) {
　　console.log('time message:' + data.msg);
    socket.emit('atime', { 'time': new Date().toJSON() });
  });
});