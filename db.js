const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;

function FirebaseDatabase(firebase) {
  if (!(this instanceof FirebaseDatabase)) return new FirebaseDatabase(firebase);

  EventEmitter.call(this);

  const self = this;

  self.db = firebase.database();

  const targetTemperatureRef = self.db.ref('targetTemperature');
  const stateRef = self.db.ref('state');

  self.addStateWithTimestamp = function addStateWithTimestamp(data) {
    const record = data;
    record.timestamp = firebase.database.ServerValue.TIMESTAMP;
    stateRef.push(record).then(
      () => {},
      (err) => {
        console.log(err);
      });
  };

  const period = 1000 * 60 * 60 * 0.05;

  const truncateData = function truncateData() {
    console.log('Truncating');
    const toDeleteRef = stateRef.orderByChild('timestamp').endAt((Date.now() - period));
    toDeleteRef.once('value', (toDelete) => {
      toDelete.forEach((child) => {
        child.ref.remove().then(
          () => {},
          (err) => {
            console.log(err);
          });
      });
    });
  };

  truncateData();
  self.truncateInterval = setInterval(truncateData, period);

  targetTemperatureRef.on('value', (data) => {
    self.emit('setTargetTemperature', data.val());
  });
}

inherits(FirebaseDatabase, EventEmitter);

FirebaseDatabase.prototype.addState = function addState(data) {
  this.addStateWithTimestamp(data);
};

FirebaseDatabase.prototype.stop = function stop() {
  clearInterval(this.truncateInterval);
  this.db.goOffline();
};

module.exports = FirebaseDatabase;
