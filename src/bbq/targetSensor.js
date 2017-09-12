const { inherits } = require('util');
const { EventEmitter } = require('events');
const gpioutil = require('pi-gpioutil');
const Sensor = require('./sensor');

function TargetSensor() {
  if (!(this instanceof TargetSensor)) return new TargetSensor();

  EventEmitter.call(this);

  const self = this;

  self.target = 20;

  self.onGPIOWrite = function onGPIOWrite(isFanOn, callback, err) {
    if (err) throw err;
    if (callback) callback(isFanOn);
  };

  self.onGPIOExport = function onGPIOExport(isFanOn, callback, err) {
    if (err) throw err;
    gpioutil.write(24, isFanOn, self.onGPIOWrite(isFanOn, callback));
  };

  self.setFan = function setFan(isFanOn, callback) {
    gpioutil.export(19, 'out', self.onGPIOExport(isFanOn, callback));
  };

  self.onSetFan = function onSetFan(isFanOn) {
    const { state } = self;
    state.fan = isFanOn;
    state.targetTemperature = self.target;
    self.emit('temperatureChange', state);
    self.state = state;
  };

  self.emitState = function emitState() {
    const { state } = self;
    const temp = state.currentTemperature;

    const belowTarget = temp < self.target;

    self.setFan(belowTarget, self.onSetFan);
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
