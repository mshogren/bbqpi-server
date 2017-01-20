const bbq = require('./bbq')();
const backend = require('./backend.js')();

const gracefulShutdown = function gracefulShutdown() {
  bbq.stop();
  backend.stop();
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

backend.on('login', (db) => {
  if (bbq.listenerCount('temperatureChange') === 0) {
    bbq.on('temperatureChange', (data) => {
      db.addState(data);
    });
  }

  if (db.listenerCount('setTargetTemperature') === 0) {
    db.on('setTargetTemperature', (temperature) => {
      bbq.setTarget(temperature);
    });
  }

  if (db.listenerCount('addSensor') === 0) {
    db.on('addSensor', (sensorData) => {
      bbq.addSensor(sensorData);
    });
  }

  if (db.listenerCount('updateSensor') === 0) {
    db.on('updateSensor', (sensorData) => {
      bbq.updateSensor(sensorData);
    });
  }

  if (db.listenerCount('removeSensor') === 0) {
    db.on('removeSensor', (sensorData) => {
      bbq.removeSensor(sensorData);
    });
  }
});

