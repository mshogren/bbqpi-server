const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const Sensor = require('./sensor.js');
const gpioutil = require('pi-gpioutil');

function TargetSensor() {
  if (!(this instanceof TargetSensor)) return new TargetSensor();

  EventEmitter.call(this);

  const self = this;

  self.target = 20;

  self.setFan = function setFan(isFanOn, callback) {
    gpioutil.write(24, isFanOn, (err) => {
      if (err) throw err;

      if (callback) callback();
    });
  };

  self.emitState = function emitState() {
    const state = self.state;
    const temp = state.temperature;

    const belowTarget = temp < self.target;

    self.setFan(belowTarget, () => {
      state.fan = belowTarget;
      state.targetTemperature = self.target;
      self.emit('temperatureChange', state);
      self.state = state;
    });
  };

  const sensor = Sensor(0);

  sensor.on('temperatureChange', (data) => {
    self.state = data;
    self.emitState();
  });

  sensor.start();

  self.sensor = sensor;
}

inherits(TargetSensor, EventEmitter);

TargetSensor.prototype.getChannel = function getChannel() {
  return 0;
};

TargetSensor.prototype.setTarget = function setTarget(target) {
  console.log('Target: ', target);

  const self = this;

  self.target = target;

  self.emitState();
};

TargetSensor.prototype.stop = function stop() {
  this.setFan(false);

  this.sensor.stop();
};

module.exports = TargetSensor;
