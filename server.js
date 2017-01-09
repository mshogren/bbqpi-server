const bbq = require('./bbq')();
const backend = require('./backend.js')();

const gracefulShutdown = function gracefulShutdown() {
  bbq.stop();
  backend.stop();
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

backend.on('login', (db) => {
  bbq.on('temperatureChange', (data) => {
    db.addState(data);
  });

  db.on('setTargetTemperature', (temperature) => {
    bbq.setTarget(temperature);
  });

  db.on('addSensor', (sensorData) => {
    bbq.addSensor(sensorData);
  });

  db.on('removeSensor', (sensorData) => {
    bbq.removeSensor(sensorData);
  });
});

