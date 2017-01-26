const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;

function FirebaseDatabase(firebase, deviceKey) {
  if (!(this instanceof FirebaseDatabase)) return new FirebaseDatabase(firebase, deviceKey);

  EventEmitter.call(this);

  const self = this;

  self.db = firebase.database();

  const uid = firebase.auth().currentUser.uid;
  const baseRef = self.db.ref(`users/${uid}/${deviceKey}`);
  const stateRef = baseRef.child('state');
  const targetTemperatureRef = baseRef.child('targetTemperature');
  const sensorRef = baseRef.child('sensor');
  const subscriptionRef = baseRef.child('subscription');

  self.addStateWithTimestamp = function addStateWithTimestamp(state) {
    const data = Object.assign({}, state, { timestamp: firebase.database.ServerValue.TIMESTAMP });

    stateRef.push(data).then(() => {}, console.log);
  };

  self.processSubscriptions = function processSubscriptionsInternal(callback) {
    subscriptionRef.once('value', snapshot => snapshot.forEach(child => callback(child.val())));
  };

  const period = 1000 * 60 * 60 * 0.05;

  const truncateData = function truncateData() {
    console.log('Truncating');
    const toDeleteRef = stateRef.orderByChild('timestamp').endAt((Date.now() - period));
    toDeleteRef.once('value', (toDelete) => {
      toDelete.forEach((child) => {
        child.ref.remove().then(() => {}, console.log);
      });
    });
  };

  truncateData();
  self.truncateInterval = setInterval(truncateData, period);

  targetTemperatureRef.on('value', (data) => {
    self.emit('setTargetTemperature', data.val());
  });

  sensorRef.on('child_added', (data) => {
    self.emit('addSensor', data.val());
  });

  sensorRef.on('child_changed', (data) => {
    self.emit('updateSensor', data.val());
  });

  sensorRef.on('child_removed', (data) => {
    self.emit('removeSensor', data.val());
  });
}

inherits(FirebaseDatabase, EventEmitter);

FirebaseDatabase.prototype.addState = function addState(data) {
  this.addStateWithTimestamp(data);
};

FirebaseDatabase.prototype.processSubscriptions = function processSubscriptions(callback) {
  this.getSubscriptions(callback);
};

FirebaseDatabase.prototype.stop = function stop() {
  clearInterval(this.truncateInterval);
  this.db.goOffline();
};

module.exports = FirebaseDatabase;
