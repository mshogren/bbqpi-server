const http = require('http');
const request = require('request');
const bonjour = require('bonjour')();

function HttpServer() {
  if (!(this instanceof HttpServer)) return new HttpServer();

  const port = 80;

  const self = this;

  self.deviceStatus = {};

  self.httpRequestHandler = function httpRequestHandler(req, res) {
    if (req.url === '/') {
      res.setHeader('Content-Type', 'application/json');
      if (process.env.RESIN) {
        const resinSupervisorUrl = `${process.env.RESIN_SUPERVISOR_ADDRESS}/v1/device?apikey=${process.env.RESIN_SUPERVISOR_API_KEY}`;
        request.get(resinSupervisorUrl, (err, response, body) => {
          console.log(body);
          res.end(JSON.stringify(self.deviceStatus));
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

  bonjour.publish({ name: 'BBQ-Pi', type: 'http', port: 80 });
}

HttpServer.prototype.setDeviceStatus = function setDeviceStatus(deviceStatus) {
  this.deviceStatus = deviceStatus;
};

module.exports = HttpServer;
