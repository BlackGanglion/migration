class NodeId {
  constructor(elementId, id) {
    this.id = elementId;
    this.text = null;
    this.requerstNodeId(id);
  }

  requerstNodeId(id) {
    this.setNodeID('获取中');
    this.addLoaaing();
    return fetch(`http://127.0.0.1:3000/getNodeID?id=${id}`)
      .then(response => response.json())
      .then(json => {
        this.setNodeID(json.nodeId);
        this.removeLoading();
      });
  }

  addLoaaing() {
    const loadingImg = document.createElement("img");
    loadingImg.id = this.id + "-loading";
    loadingImg.src = "./static/loading.png";
    $('#' + this.id)[0].appendChild(loadingImg);
  }

  removeLoading() {
    $('#' + this.id + "-loading").remove();
  }

  getNodeID() {
    return $('#' + this.id + "-text").text();
  }

  setNodeID(nodeId) {
    if (this.text) this.removeNodeID();

    this.text = document.createElement("span");
    this.text.id = this.id + "-text";
    this.text.textContent = nodeId;
    $('#' + this.id)[0].appendChild(this.text);
  }

  removeNodeID() {
    $('#' + this.id + "-text").remove();
  }
}

const nodeElement0 = new NodeId('nodeid-0', 0);
const nodeElement1 = new NodeId('nodeid-1', 1);

class migrate {
  constructor(elementId, id) {
    this.id = elementId;
    this.listenButton(id);
  }

  listenButton(id) {
    $('#move-' + id).on('click', () => {
      this.addLoading();
      this.setMigrateText('迁移中');
      fetch(`http://127.0.0.1:3000/migrate?id=${id}`)
        .then(response => response.json())
        .then(json => {
          this.removeLoading();
          if (json.res == 'success') {
            this.setMigrateText('迁移完成');
            if (id == 0) {
              nodeElement0.requerstNodeId(id);
            } else {
              nodeElement1.requerstNodeId(id);
            };
          } else {
            this.setMigrateText('迁移失败');
          } 
        });
    });
  }

  addLoading() {
    const loadingImg = document.createElement("img");
    loadingImg.id = this.id + "-loading";
    loadingImg.src = "./static/loading.png";
    $('#' + this.id)[0].appendChild(loadingImg);
  }

  removeLoading() {
    $('#' + this.id + '-loading').remove();
  }

  setMigrateText(text) {
    $('#' + this.id + '-text').text(text);
  }
}

const migrateElement1 = new migrate('migrate-0', 0);
const migrateElement2 = new migrate('migrate-1', 1);
