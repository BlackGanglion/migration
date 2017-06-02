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

/**
 * 得到 nodeID / node4, node8
 */
app.get('/getNodeID', function (req, res) {
  const { id } = req.query;
  getNodeCurrent(id).then((nodeId) => {
    res.json({ nodeId });
  });
});

/**
 * 迁移接口，输入 id 完成迁移
 */
app.get('/migrate', function (req, res) {
  const { id } = req.query;
  migrate(id).then(() => {
    res.json({
      res: 'success',
    });
  }, () => {
    res.json({
      res: 'error',
    });
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