const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const mcpadc = require('mcp-spi-adc');

function Sensor(channel) {
  if (!(this instanceof Sensor)) return new Sensor(channel);

  this.channel = channel;

  EventEmitter.call(this);
}

inherits(Sensor, EventEmitter);

Sensor.prototype.start = function start() {
  const self = this;

  let data;

  self.tempSensor = mcpadc.open(self.channel, { speedHz: 20000 }, (openErr) => {
    if (openErr) throw openErr;

    self.interval = setInterval(() => {
      self.tempSensor.read((readErr, reading) => {
        if (readErr) throw readErr;

        const temp = Math.round(((reading.value * 3.3) - 0.5) * 100);

        if (temp !== data) {
          data = temp;
          self.emit('temperatureChange', data);
        }
      });
    }, 1000);
  });
};

Sensor.prototype.stop = function stop() {
  clearInterval(this.interval);
};

module.exports = Sensor;

