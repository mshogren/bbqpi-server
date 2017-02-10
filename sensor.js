const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const mcpadc = require('mcp-spi-adc');

function calculateTemperatureTMP36(reading) {
  const celcius = ((reading.value * 3.3) - 0.5) * 100;
  const fahrenheit = (celcius * 1.8) + 32;

  return Math.round(fahrenheit);
}

function calculateTemperatureTX1000(reading) {
  const R = 1e+4 * ((1023.0 / reading.rawValue) - 1.0);
  const lnR = Math.log(R);

  const kelvin = 1.0 / ((((lnR * lnR * 1.3193731e-7) + 2.0959138e-4) * lnR) + 7.6253948e-4);
  const celcius = kelvin - 273.15;
  const fahrenheit = (celcius * 1.8) + 32;

  return Math.round(fahrenheit);
}

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
    return (self.channel === 0)
      ? calculateTemperatureTMP36(reading)
      : calculateTemperatureTX1000(reading);
  };
}

inherits(Sensor, EventEmitter);

Sensor.prototype.start = function start() {
  const self = this;

  const tempSensor = mcpadc.open(self.channel, { speedHz: 20000 }, (openErr) => {
    if (openErr) throw openErr;

    self.interval = setInterval(() => {
      tempSensor.read((readErr, reading) => {
        if (readErr) throw readErr;

        const temperature = self.calculateTemperature(reading);
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

