const { inherits } = require('util');
const { EventEmitter } = require('events');
const TargetSensor = require('./targetSensor');
const AlarmSensor = require('./alarmSensor');

function BBQController() {
  if (!(this instanceof BBQController)) return new BBQController();

  EventEmitter.call(this);

  const self = this;

  self.sensors = [];

  self.addSensorInternal = function addSensorInternal(sensor) {
    sensor.on('temperatureChange', (state) => {
      self.emit('temperatureChange', state);
    });

    sensor.on('alarm', (alarmData) => {
      self.emit('alarm', alarmData);
    });

    self.sensors.push(sensor);
  };

  self.getSensorIndexByChannel = function getSensorIndexByChannel(channel) {
    return self.sensors.findIndex((sensor) => sensor.getChannel() === channel);
  };

  const targetSensor = TargetSensor();

  self.targetSensor = targetSensor;

  self.addSensorInternal(targetSensor);
}

inherits(BBQController, EventEmitter);

BBQController.prototype.setTarget = function setTarget(targetTemperature) {
  this.targetSensor.setTarget(targetTemperature);
};

BBQController.prototype.isFanControllerInitialized = function isFanControllerInitialized() {
  return this.targetSensor.isFanControllerInitialized();
};

BBQController.prototype.initializeFanController = function initializeFanController(
  states
) {
  this.targetSensor.initializeFanController(states);
};

BBQController.prototype.addSensor = function addSensor(sensorData) {
  const self = this;

  const { channel } = sensorData;

  const sensor = AlarmSensor(sensorData);

  self.addSensorInternal(sensor);

  console.log(`Added sensor on channel ${channel}`);
};

BBQController.prototype.updateSensor = function updateSensor(sensorData) {
  const self = this;

  const { channel } = sensorData;

  const index = self.getSensorIndexByChannel(channel);

  self.sensors[index].updateSensor(sensorData);

  console.log(`Updated sensor on channel ${channel}`);
};

BBQController.prototype.removeSensor = function removeSensor(sensorData) {
  const self = this;

  const { channel } = sensorData;

  const index = self.getSensorIndexByChannel(channel);

  self.sensors[index].stop();

  self.sensors.splice(index, 1);

  console.log(`Removed sensor on channel ${channel}`);
};

BBQController.prototype.stop = function stop() {
  this.sensors.forEach((s) => {
    s.stop();
  });
};

module.exports = BBQController;
