const Http = require('./http');
const Bbq = require('./bbq');
const Pusher = require('./push');
const Backend = require('./backend');

const addSingletonListener = function addSingletonListener(emitter, event, callback) {
  if (emitter.listenerCount(event) === 0) {
    emitter.on(event, callback);
  }
};

function Server() {
  if (!(this instanceof Server)) return new Server();

  const http = Http();
  const bbq = Bbq();
  const pusher = Pusher();
  const backend = Backend(pusher.publicKey);

  this.bbq = bbq;
  this.backend = backend;

  backend.on('authorizationPending', (status) => {
    http.setDeviceStatus(status);
  });

  backend.on('login', (db) => {
    if (bbq.isFanControllerInitialized()) {
      db.getPreviousStates((states) => {
        bbq.initializeFanController(states);
      });
    }

    addSingletonListener(bbq, 'temperatureChange', (data) => {
      db.addState(data);
    });

    addSingletonListener(bbq, 'alarm', (alarmData) => {
      console.log(alarmData);
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
}

Server.prototype.stop = function stop() {
  this.bbq.stop();
  this.backend.stop();
};

module.exports = Server;
