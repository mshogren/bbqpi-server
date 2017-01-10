const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const mcpadc = require('mcp-spi-adc');

function Sensor(channel, name) {
  if (!(this instanceof Sensor)) return new Sensor(channel, name);

  this.channel = channel;
  this.state = {
    channel,
  };

  if (name) this.state.name = name;

  EventEmitter.call(this);
}

inherits(Sensor, EventEmitter);

Sensor.prototype.start = function start() {
  const self = this;

  const tempSensor = mcpadc.open(self.channel, { speedHz: 20000 }, (openErr) => {
    if (openErr) throw openErr;

    self.interval = setInterval(() => {
      tempSensor.read((readErr, reading) => {
        if (readErr) throw readErr;

        const temperature = Math.round(((reading.value * 3.3) - 0.5) * 100);
        const state = self.state;

        if (temperature !== state.currentTemperature) {
          state.currentTemperature = temperature;
          self.emit('temperatureChange', state);
          self.state = state;
        }
      });
    }, 1000);
  });
};

Sensor.prototype.getChannel = function getChannel() {
  return this.channel;
};

Sensor.prototype.stop = function stop() {
  clearInterval(this.interval);
};

module.exports = Sensor;

