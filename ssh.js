var Client = require('ssh2').Client;

const nodeRegex = /node\d?/g;
const nodeCommand = 'source admin_rc && nova show d43f0c8f-e1f6-4ea0-86f1-7fc3010fe0ab | grep \'OS-EXT-SRV-ATTR:host\'';

const server = [
  // 正常测试机
  {
    user: 'root',
    port: 22,
    host: '10.65.7.11',
    password: 'cloud305'
  },
  // 错误测试机
  {
    user: 'root',
    port: 22,
    host: '10.1.18.56',
    password: 'centos'
  }
];

const nodeCommandList = [
  'source admin_rc && nova show d43f0c8f-e1f6-4ea0-86f1-7fc3010fe0ab | grep \'OS-EXT-SRV-ATTR:host\'',
  'source admin_rc && nova show 4ffda339-43b5-4e53-be6f-a83a55402e81 | grep \'OS-EXT-SRV-ATTR:host\'',
];

function command(id, nodeID) {
  if (id == 0) {
    return 'source admin_rc && nova live-migration d43f0c8f-e1f6-4ea0-86f1-7fc3010fe0ab '
      + (nodeID === 'node8' ? 'node4' : 'node8');
  } else {
    return 'source admin_rc && nova live-migration 1d68231a-14be-4996-ac42-d9b2b3fe88bb '
      + (nodeID === 'node8' ? 'node4' : 'node8');
  }
}
        
/**
 * 连接ssh
 * @param {*} id node编号 
 */
const connect = (id) => {
  var conn = new Client();
  return new Promise((resolve, reject) => {
    conn.on('ready', function() {
      resolve(conn);
    }).connect(server[id]);
  });
}

const getNode = (conn, id) => {
  return new Promise((resolve, reject) => {
    conn.exec(nodeCommandList[id], function(err, stream) {
      if (err) {
        reject(err);
      }
      stream.on('data', function(data) {
        const filter = data.toString().replace(/\s/g, "");
        console.log(nodeCommandList[id], filter);
        const nodeID = filter.match(nodeRegex)[0];
        console.log(filter, nodeID);
        resolve(nodeID);
      }).stderr.on('data', function(err) {
        console.log(err.toString());
        reject(err);
      });
    });
  });
}

const submitMigration = (conn, nodeID, id) => {
  return new Promise((resolve, reject) => {
    console.log(command);
    conn.exec(command(id, nodeID), function(err, stream) {
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
const getNodeByTurn = (conn, nodeID, resolve, id, count) => {
  console.log('getNodeByTurn: ' + nodeID);
  const func = (n) => {
    getNode(conn, id).then((newNodeID) => {
      console.log(newNodeID, nodeID, n);
      if (newNodeID !== nodeID) {
        resolve();
        conn.end();
      } else {
        if (n === 10) {
          reject();
        }
        getNodeByTurn(conn, nodeID, resolve, id, n + 1);
      }
    });
  };

  if (handler) clearTimeout(handler);
  handler = setTimeout(func.bind(this, count), 100);
} 

/**
 * 迁移
 */
exports.migrate = (id) => {
  return new Promise((resolve, reject) => {
    connect(id).then((conn) => {
      getNode(conn, id).then((nodeID) => {
        submitMigration(conn, nodeID, id).then(() => {
          getNodeByTurn(conn, nodeID, resolve, id, 0);
        });
      });
    });
  });
}

/**
 * 获取nodeID
 */
exports.getNodeCurrent = (id) => {
  return new Promise((resolve, reject) => {
    connect(id).then((conn) => {
      getNode(conn, id).then((nodeID) => {
        resolve(nodeID);
      })
    });
  });
}

