const file = require('./file');

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/view/index.html');
});

io.on('connection', function (client) {
  client.on('filename', function (filename) {
    file.tailf(filename, err => {
      console.log('err: ' + err);
    }, data => {
      client.emit(filename, data);
      console.log("emit");
    });
  });
});

server.listen(3000);