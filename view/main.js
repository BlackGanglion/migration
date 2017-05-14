class NodeId {
  constructor() {
    this.text = null;
    this.requerstNodeId();
  }

  requerstNodeId() {
    this.setNodeID('获取中');
    this.addLoaaing();
    return fetch('http://127.0.0.1:3000/getNodeID')
      .then(response => response.json())
      .then(json => {
        this.setNodeID(json.nodeId);
        this.removeLoading();
      });
  }

  addLoaaing() {
    const loadingImg = document.createElement("img");
    loadingImg.id = "nodeid-loading";
    loadingImg.src = "./static/loading.png";
    $('#nodeid')[0].appendChild(loadingImg);
  }

  removeLoading() {
    $('#nodeid-loading').remove();
  }

  getNodeID() {
    return $('#nodeid-text').text();
  }

  setNodeID(nodeId) {
    if (this.text) this.removeNodeID();

    this.text = document.createElement("span");
    this.text.id = "nodeid-text";
    this.text.textContent = nodeId;
    $('#nodeid')[0].appendChild(this.text);
  }
  
  removeNodeID() {
    $('#nodeid-text').remove();
  }
}

const nodeElement = new NodeId();

class migrate {
  constructor() {
    this.listenButton();
  }

  listenButton() {
    $('#move').on('click', () => {
      this.addLoading();
      this.setMigrateText('迁移中');
      fetch(`http://127.0.0.1:3000/migrate`)
        .then(response => response.json())
        .then(json => {
          this.removeLoading();
          this.setMigrateText('迁移完成');
          nodeElement.requerstNodeId();
        });
    });
  }

  addLoading() {
    const loadingImg = document.createElement("img");
    loadingImg.id = "migrate-loading";
    loadingImg.src = "./static/loading.png";
    $('#status')[0].appendChild(loadingImg);
  }

  removeLoading() {
    $('#migrate-loading').remove();
  }

  setMigrateText(text) {
    $('#migrate-text').text(text);
  }
}

const migrateElement = new migrate();

