const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;

function FirebaseDatabase(firebase, deviceKey) {
  if (!(this instanceof FirebaseDatabase)) return new FirebaseDatabase(firebase, deviceKey);

  EventEmitter.call(this);

  const self = this;

  self.db = firebase.database();

  const uid = firebase.auth().currentUser.uid;
  const userRef = self.db.ref(`users/${uid}`);
  const baseRef = userRef.child(deviceKey);
  const deviceRef = userRef.child('device');
  const stateRef = baseRef.child('state');
  const targetTemperatureRef = baseRef.child('targetTemperature');
  const sensorRef = baseRef.child('sensor');
  const subscriptionRef = baseRef.child('subscription');

  deviceRef.child(deviceKey)
    .update({ timestamp: firebase.database.ServerValue.TIMESTAMP })
    .then(() => {}, console.log);

  self.addStateWithTimestamp = function addStateWithTimestamp(state) {
    const data = Object.assign({}, state, { timestamp: firebase.database.ServerValue.TIMESTAMP });

    stateRef.push(data).then(() => {}, console.log);
  };

  self.processSubscriptionsInternal = function processSubscriptionsInternal(callback) {
    subscriptionRef.once('value', snapshot => snapshot.forEach(child => callback(child.val())));
  };

  const period = 1000 * 60 * 60 * 8;

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
  self.truncateInterval = setInterval(truncateData, period / 160);

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
  this.processSubscriptionsInternal(callback);
};

FirebaseDatabase.prototype.stop = function stop() {
  clearInterval(this.truncateInterval);
  this.db.goOffline();
};

module.exports = FirebaseDatabase;
