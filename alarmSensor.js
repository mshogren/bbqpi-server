const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const Sensor = require('./sensor.js');

function AlarmSensor(channel, name) {
  if (!(this instanceof AlarmSensor)) return new AlarmSensor(channel, name);

  EventEmitter.call(this);

  const self = this;

  const sensor = Sensor(channel, name);

  sensor.on('temperatureChange', (data) => {
    self.emit('temperatureChange', data);
  });

  sensor.start();

  self.sensor = sensor;
}

inherits(AlarmSensor, EventEmitter);

AlarmSensor.prototype.getChannel = function getChannel() {
  return this.sensor.getChannel();
};

AlarmSensor.prototype.stop = function stop() {
  this.sensor.stop();
};

module.exports = AlarmSensor;
