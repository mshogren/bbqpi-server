const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const TargetSensor = require('./targetSensor.js');
const AlarmSensor = require('./alarmSensor.js');

function BBQController() {
  if (!(this instanceof BBQController)) return new BBQController();

  EventEmitter.call(this);

  const self = this;

  self.sensors = [];

  self.addSensorInternal = function addSensorInternal(sensor) {
    sensor.on('temperatureChange', (state) => {
      self.emit('temperatureChange', state);
    });

    self.sensors.push(sensor);
  };

  const targetSensor = TargetSensor();

  self.targetSensor = targetSensor;

  self.addSensorInternal(targetSensor);
}

inherits(BBQController, EventEmitter);

BBQController.prototype.setTarget = function setTarget(targetTemperature) {
  this.targetSensor.setTarget(targetTemperature);
};

BBQController.prototype.addSensor = function addSensor(sensorData) {
  const self = this;

  const sensor = AlarmSensor(sensorData.channel, sensorData.name);

  self.addSensorInternal(sensor);

  console.log(`Added sensor on channel ${sensorData.channel}`);
};

BBQController.prototype.removeSensor = function removeSensor(sensorData) {
  const self = this;

  const index = self.sensors.findIndex(sensor => (sensor.getChannel() === sensorData.channel));

  self.sensors[index].stop();

  self.sensors.splice(index, 1);

  console.log(`Removed sensor on channel ${sensorData.channel}`);
};

BBQController.prototype.stop = function stop() {
  this.sensors.forEach((s) => {
    s.stop();
  });
};

module.exports = BBQController;
