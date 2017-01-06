const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const Sensor = require('./sensor.js');
const data = require('./config.js');
const gpioutil = require('pi-gpioutil');

function BBQController() {
  if (!(this instanceof BBQController)) return new BBQController();

  EventEmitter.call(this);

  const self = this;

  self.target = 20;
  self.sensors = [];

  self.setFan = function setFan(isFanOn, callback) {
    gpioutil.write(24, isFanOn, (err) => {
      if (err) throw err;

      if (callback) callback();
    });
  };

  self.handleGrillChange = function handleGrillChange() {
    const temp = data.grillSensor.temperature;

    const belowTarget = temp < self.target;

    self.setFan(belowTarget, () => {
      data.fan = belowTarget;
      self.emit('temperatureChange', data);
    });
  };

  self.setupSensor = function setupSensor(sensorData, callback) {
    const sensor = Sensor(sensorData.channel);
    self.sensors.push(sensor);

    sensor.start();

    sensor.on('temperatureChange', (temp) => {
      sensorData.setTemperature(temp);

      callback();
    });
  };

  self.setupSensor(data.grillSensor, () => {
    self.handleGrillChange();
  });

  data.otherSensors.forEach((sensorData) => {
    self.setupSensor(sensorData, () => {
      self.emit('temperatureChange', data);
    });
  });
}

inherits(BBQController, EventEmitter);

BBQController.prototype.setTarget = function setTarget(target) {
  const self = this;

  self.target = target;

  self.handleGrillChange();
};

BBQController.prototype.stop = function stop() {
  this.setFan(false);

  this.sensors.forEach((s) => {
    s.stop();
  });
};

module.exports = BBQController;
