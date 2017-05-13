function keyLight(sText, key, className) {
  var sKey = "<span class='"+ className + "'>"+key+"</span>",
      num = -1,
      rStr = new RegExp(key, "g"),
      rHtml = new RegExp("\<.*?\>","ig"), //匹配html元素
      aHtml = sText.match(rHtml); //存放html元素的数组
      sText = sText.replace(rHtml, '{~}');  //替换html标签
      sText = sText.replace(rStr, sKey); //替换key
      sText = sText.replace(/{~}/g, function(){  //恢复html标签
        num++;
        return aHtml[num];
      });
    return sText;
};

const path = '/var/log/nova/';
const logMap = [
  // './test.log',
  '/var/log/nova/nova-api.log',
  '/var/log/nova/nova-manage.log',
  '/var/log/nova/nova-cert.log',
  '/var/log/nova/nova-conductor.log',
  '/var/log/nova/nova-novncproxy.log',
  '/var/log/nova/nova-compute.log',
  '/var/log/nova/nova-consoleauth.log',
  '/var/log/nova/nova-scheduler.log'
];

const keyLightRecursion = function(text, keyList) {
  if (keyList.length === 0) {
    return text;
  }
  return keyLightRecursion(
    keyLight(text, keyList[0], 'highlight'),
    keyList.slice(1)
  );
}

var socket = io.connect('http://10.1.18.56:3000');
// var socket = io.connect('http://127.0.0.1:3000');
for (let i = 0; i < logMap.length; i++) {
  socket.emit('filename', logMap[i]);
  socket.on(logMap[i], function (data) {
    var element = document.getElementById('content' + logMap[i]);
    var para = document.createElement("div");
    var text = keyLightRecursion(
      data, 
      ['ERROR', 'error', 'CRITICAL', 'critical', 'TRACE', 'trace'], 
      'highlight'
    );
    console.log(para, text);
    para.innerHTML = text;
    data && element.appendChild(para);
  });
}