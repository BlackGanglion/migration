const file = require('./file');
const { getNodeCurrent, migrate } = require('./ssh');

var app = require('express')();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var count = 0;

app.all('*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/view/index.html');
});

app.get('/getNodeID', function (req, res) {
  getNodeCurrent().then((nodeId) => {
    res.json({ nodeId });
  });
});

app.get('/migrate', function (req, res) {
  migrate().then(() => {
    res.json({});
  });
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