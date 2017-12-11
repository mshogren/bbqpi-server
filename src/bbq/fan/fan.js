const { inherits } = require('util');
const { EventEmitter } = require('events');
const gpio = require('./gpio');

const calculateFanLevel = function calculateFanLevel(
  targetTemperature,
  currentTemperature
) {
  const error = targetTemperature - currentTemperature;

  if (error < 0) return 0;
  if (error > 100) return 1023;

  return 1023 * (error / 100);
};

function FanController() {
  if (!(this instanceof FanController)) return new FanController();

  EventEmitter.call(this);

  const self = this;

  self.target = 20;

  self.state = { currentTemperature: 20 };

  self.setFanLevel = function setFanLevel(fanLevel) {
    return gpio.setPWMLevel(fanLevel);
  };

  self.onSetFanLevel = function onSetFanLevel(fanLevel) {
    const { state } = self;
    state.fanLevel = fanLevel;
    state.targetTemperature = self.target;
    self.emit('fanChange', state);
    self.state = state;
  };

  self.emitState = function emitState(data) {
    if (data) self.state = data;

    const { state } = self;

    const fanLevel = calculateFanLevel(self.target, state.currentTemperature);

    self.setFanLevel(fanLevel).then(self.onSetFanLevel);
  };
}

inherits(FanController, EventEmitter);

FanController.prototype.isInitialized = function isInitialized() {
  return false;
};

FanController.prototype.initialize = function initialize() {};

FanController.prototype.setTarget = function setTarget(target) {
  console.log('Target: ', target);

  const self = this;

  self.target = target;

  self.emitState();
};

FanController.prototype.addState = function addState(data) {
  const self = this;

  self.emitState(data);
};

FanController.prototype.stop = function stop() {
  this.setFanLevel(0);
};

module.exports = FanController;
