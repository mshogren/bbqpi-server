const http = require('http');
const bonjour = require('bonjour');

function HttpServer() {
  if (!(this instanceof HttpServer)) return new HttpServer();

  const port = 80;

  this.deviceStatus = {};

  http.createServer((request, response) => {
    response.setHeader('Content-Type', 'application/json');
    response.end(this.deviceStatus);
  }).listen(port);

  bonjour.publish({ name: 'BBQ-Pi', type: 'http', port: 80 });
}

HttpServer.prototype.setDeviceStatus = function setDeviceStatus(deviceStatus) {
  this.deviceStatus = deviceStatus;
};

module.exports = HttpServer;
