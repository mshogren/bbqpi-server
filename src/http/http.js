const http = require('http');
const dnssd = require('dnssd');
const request = require('request');
const config = require('../config');

function HttpServer() {
  if (!(this instanceof HttpServer)) return new HttpServer();

  const port = 8080;

  const self = this;

  self.deviceStatus = {};

  self.httpRequestHandler = function httpRequestHandler(req, res) {
    if (req.url === '/') {
      res.setHeader('Content-Type', 'application/json');
      if (config.resin) {
        const {
          RESIN_SUPERVISOR_ADDRESS,
          RESIN_SUPERVISOR_API_KEY,
        } = process.env;
        const resinSupervisorUrl = `${RESIN_SUPERVISOR_ADDRESS}/v1/device?apikey=${RESIN_SUPERVISOR_API_KEY}`;
        request.get(resinSupervisorUrl, (err, response, body) => {
          res.end(
            JSON.stringify(
              Object.assign(self.deviceStatus, {
                resinSupervisorStatus: JSON.parse(body),
              })
            )
          );
        });
      } else {
        res.end(JSON.stringify(self.deviceStatus));
      }
    } else {
      res.statusCode = 404;
      res.end();
    }
  };

  self.server = http.createServer(self.httpRequestHandler);
  self.server.listen(port);

  self.advertisement = new dnssd.Advertisement(dnssd.tcp('http'), port, {
    name: 'bbqpi',
    host: 'bbqpi',
  });
  self.advertisement.start();
}

HttpServer.prototype.setDeviceStatus = function setDeviceStatus(deviceStatus) {
  this.deviceStatus = deviceStatus;
};

HttpServer.prototype.stop = function stop() {
  this.advertisement.stop();
  this.server.close();
};

module.exports = HttpServer;
