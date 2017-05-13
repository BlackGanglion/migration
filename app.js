const file = require('./file');

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var count = 0;

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/view/index.html');
});

io.on('connection', function (client) {
  client.on('filename', function (filename) {
    file.tailf(filename, err => {
      console.log('err: ' + err);
    }, data => {
      client.emit(filename, data);
      console.log("emit", count++);
    });
  });
});

server.listen(3000);