const bbq = require('./bbq')();
const pusher = require('./push.js')();
const backend = require('./backend.js')(pusher.publicKey);

const gracefulShutdown = function gracefulShutdown() {
  bbq.stop();
  backend.stop();
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const addSingletonListener = function addSingletonListener(emitter, event, callback) {
  if (emitter.listenerCount(event) === 0) {
    emitter.on(event, callback);
  }
};

backend.on('login', (db) => {
  addSingletonListener(bbq, 'temperatureChange', (data) => {
    db.addState(data);
  });

  addSingletonListener(bbq, 'alarm', (alarmData) => {
    console.log(`Alarm: ${alarmData}`);
    db.processSubscriptions((subscription) => {
      pusher.sendNotification(subscription, JSON.stringify(alarmData));
    });
  });

  addSingletonListener(db, 'setTargetTemperature', (temperature) => {
    bbq.setTarget(temperature);
  });

  addSingletonListener(db, 'addSensor', (sensorData) => {
    bbq.addSensor(sensorData);
  });

  addSingletonListener(db, 'updateSensor', (sensorData) => {
    bbq.updateSensor(sensorData);
  });

  addSingletonListener(db, 'removeSensor', (sensorData) => {
    bbq.removeSensor(sensorData);
  });
});

