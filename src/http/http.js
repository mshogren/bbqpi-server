const http = require('http');
const request = require('request');
const bonjour = require('bonjour')();

function HttpServer() {
  if (!(this instanceof HttpServer)) return new HttpServer();

  const port = 80;
  const resinSupervisorUrl = `${process.env.RESIN_SUPERVISOR_ADDRESS}/v1/device?apikey=${process.env.RESIN_SUPERVISOR_API_KEY}`;

  this.deviceStatus = {};

  http.createServer((req, res) => {
    request.get(resinSupervisorUrl, (err, resinResponse, body) => {
      console.log(body);
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify(this.deviceStatus));
    });
  }).listen(port);

  bonjour.publish({ name: 'BBQ-Pi', type: 'http', port: 80 });
}

HttpServer.prototype.setDeviceStatus = function setDeviceStatus(deviceStatus) {
  this.deviceStatus = deviceStatus;
};

module.exports = HttpServer;
