const { inherits } = require('util');
const { EventEmitter } = require('events');
const Sensor = require('./sensor');
const FanController = require('./fan');

function TargetSensor() {
  if (!(this instanceof TargetSensor)) return new TargetSensor();

  EventEmitter.call(this);

  const self = this;

  self.emitState = function emitState(data) {
    const state = { ...self.state, ...data };
    self.emit('temperatureChange', state);
    self.state = state;
  };

  const sensor = Sensor(0);

  sensor.start();

  self.sensor = sensor;

  const fan = FanController();

  self.fan = fan;

  fan.on('fanChange', (data) => self.emitState(data));

  sensor.on('temperatureChange', (data) => {
    self.emitState(data);
    self.fan.addState(data);
  });
}

inherits(TargetSensor, EventEmitter);

TargetSensor.prototype.getChannel = function getChannel() {
  return 0;
};

TargetSensor.prototype.isFanControllerInitialized = function isFanControllerInitialized() {
  return this.fan.isInitialized();
};

TargetSensor.prototype.initializeFanController = function initializeFanController(
  states
) {
  this.fan.initialize(states);
};

TargetSensor.prototype.setTarget = function setTarget(target) {
  this.fan.setTarget(target);
};

TargetSensor.prototype.stop = function stop() {
  this.fan.stop();
  this.sensor.stop();
};

module.exports = TargetSensor;
