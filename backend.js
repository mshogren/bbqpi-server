const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const firebase = require('firebase');
const config = require('./config');
const auth = require('./auth');
const db = require('./db');

function FirebaseBackend(deviceKey) {
  if (!(this instanceof FirebaseBackend)) return new FirebaseBackend(deviceKey);

  EventEmitter.call(this);

  const self = this;

  firebase.initializeApp(config.getSync('firebaseConfig'));

  self.auth = auth(firebase);

  self.auth.on('login', () => {
    self.db = self.db || db(firebase, deviceKey);
    self.emit('login', self.db);
  });
}

inherits(FirebaseBackend, EventEmitter);

FirebaseBackend.prototype.stop = function stop() {
  if (this.db) this.db.stop();
  this.auth.stop();
};

module.exports = FirebaseBackend;
