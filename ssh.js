var Client = require('ssh2').Client;
var conn = new Client();

const nodeRegex = /node\d?/g;
const nodeCommand = 'source admin_rc && nova show d43f0c8f-e1f6-4ea0-86f1-7fc3010fe0ab | grep \'OS-EXT-SRV-ATTR:host\'';

const connect = () => {
  return new Promise((resolve, reject) => {
    conn.on('ready', function() {
      resolve();
    }).connect({
      user: 'root',
      port: 22,
      host: '10.65.7.11',
      password: 'cloud305'
    });
  });
}

let old;
const getNode = () => {
  return new Promise((resolve, reject) => {
    conn.exec(nodeCommand, function(err, stream) {
      if (err) {
        reject(err);
      }
      stream.on('data', function(data) {
        const filter = data.toString().replace(/\s/g, "");
        const nodeID = filter.match(nodeRegex)[0];
        console.log(filter, nodeID);
        resolve(nodeID);
      }).stderr.on('data', function(err) {
        console.log(err);
        reject(data);
      });
    });
  });
}

const submitMigration = (nodeID) => {
  return new Promise((resolve, reject) => {
    const command = 
        'source admin_rc && nova live-migration d43f0c8f-e1f6-4ea0-86f1-7fc3010fe0ab ' 
        + (nodeID === 'node8' ? 'node4' : 'node8');

    console.log(command);
    conn.exec(command, function(err, stream) {
        if (err) {
          console.log('command: ' + err.toString());
          conn.end();
          reject(err);
        }

        stream.on('close', function() {
          resolve();
        }).on('data', function(data) {
          resolve();
        }).stderr.on('data', function(err) {
          console.log('data: ' + err.toString());
          reject(err);
        });
      });
  });
}

let handler;
const getNodeByTurn = (nodeID) => {
  console.log('getNodeByTurn: ' + nodeID);
  const func = () => {
    getNode().then((newNodeID) => {
      console.log(newNodeID, nodeID);
      if (newNodeID !== nodeID) {
        console.log('ok ans close');
        conn.end();
      } else {
        getNodeByTurn(nodeID);
      }
    });
  };

  if (handler) clearTimeout(handler);
  handler = setTimeout(func, 0);
} 

connect().then(() => {
  getNode().then((nodeID) => {
    submitMigration(nodeID).then(() => {
      getNodeByTurn(nodeID);
    });
  });
});

