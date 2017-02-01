const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const Sensor = require('./sensor.js');

function AlarmSensor(sensorData) {
  if (!(this instanceof AlarmSensor)) {
    return new AlarmSensor(sensorData);
  }

  EventEmitter.call(this);

  const { channel, name, alarmEnabled, alarmTemperature } = sensorData;

  const self = this;

  self.alarmEnabled = alarmEnabled;
  self.alarmTemperature = alarmTemperature;

  self.checkAlarm = function checkAlarm() {
    if (self.alarmEnabled) {
      if (self.currentTemperature >= self.alarmTemperature) {
        self.emit('alarm', {
          channel,
          name: self.sensor.getName(),
          alarmEnabled: self.alarmEnabled,
          alarmTemperature: self.alarmTemperature,
          currentTemperature: self.currentTemperature,
        });
      }
    }
  };

  const sensor = Sensor(channel, name);

  sensor.on('temperatureChange', (data) => {
    self.emit('temperatureChange', data);

    self.currentTemperature = data.currentTemperature;

    self.checkAlarm();
  });

  sensor.start();

  self.sensor = sensor;
}

inherits(AlarmSensor, EventEmitter);

AlarmSensor.prototype.getChannel = function getChannel() {
  return this.sensor.getChannel();
};

AlarmSensor.prototype.updateSensor = function updateSensor(sensorData) {
  const self = this;

  const { name, alarmEnabled, alarmTemperature } = sensorData;

  self.sensor.setName(name);
  self.alarmEnabled = alarmEnabled;
  self.alarmTemperature = alarmTemperature;

  self.checkAlarm();
};

AlarmSensor.prototype.stop = function stop() {
  this.sensor.stop();
};

module.exports = AlarmSensor;
