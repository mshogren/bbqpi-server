const SensorData = require('./sensorData.js');

module.exports = {
  date: new Date(),
  fan: false,
  grillSensor: SensorData(0),
  otherSensors: [
    SensorData(1, 'Meat Temp'),
  ],
};

