const http = require('http');
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
        const resinSupervisorUrl = `${
          process.env.RESIN_SUPERVISOR_ADDRESS
        }/v1/device?apikey=${process.env.RESIN_SUPERVISOR_API_KEY}`;
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

  http.createServer(self.httpRequestHandler).listen(port);
}

HttpServer.prototype.setDeviceStatus = function setDeviceStatus(deviceStatus) {
  this.deviceStatus = deviceStatus;
};

module.exports = HttpServer;
