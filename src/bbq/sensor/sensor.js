const { inherits } = require('util');
const { EventEmitter } = require('events');
const mcpadc = require('mcp-spi-adc');
const calculator = require('./temperature');

function Sensor(channel, name) {
  if (!(this instanceof Sensor)) return new Sensor(channel, name);

  this.channel = channel;
  this.state = {
    channel,
  };

  if (name) this.state.name = name;

  EventEmitter.call(this);

  const self = this;

  self.calculateTemperature = function calculateTemperature(reading) {
    const temperature = (self.channel === 0)
      ? calculator.calculateTemperatureTMP36(reading)
      : calculator.calculateTemperatureTX1000(reading);

    return Math.round(temperature);
  };

  self.onReadSensorData = function onReadSensorData(readErr, reading) {
    if (readErr) throw readErr;

    const temperature = self.calculateTemperature(reading);
    const { state } = self;

    if (temperature !== state.currentTemperature) {
      state.currentTemperature = temperature;
      self.emit('temperatureChange', state);
      self.state = state;
    }
  };

  self.readSensorData = function readSensorData() {
    self.tempSensor.read(self.onReadSensorData);
  };

  self.onChannelOpen = function onChannelOpen(openErr) {
    if (openErr) throw openErr;

    self.interval = setInterval(self.readSensorData, 3000);
  };
}

inherits(Sensor, EventEmitter);

Sensor.prototype.start = function start() {
  this.tempSensor = mcpadc.open(this.channel, { speedHz: 20000 }, this.onChannelOpen);
};

Sensor.prototype.getChannel = function getChannel() {
  return this.channel;
};

Sensor.prototype.getName = function getName() {
  return this.state.name;
};

Sensor.prototype.setName = function setName(name) {
  this.state.name = name;
};

Sensor.prototype.stop = function stop() {
  clearInterval(this.interval);
};

module.exports = Sensor;

