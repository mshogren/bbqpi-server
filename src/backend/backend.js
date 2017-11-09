const { inherits } = require('util');
const { EventEmitter } = require('events');
const firebase = require('firebase');
const config = require('../config');
const auth = require('./auth');
const db = require('./db');

function FirebaseBackend(deviceKey) {
  if (!(this instanceof FirebaseBackend)) return new FirebaseBackend(deviceKey);

  EventEmitter.call(this);

  const self = this;

  firebase.initializeApp(config.store.getSync('firebaseConfig'));

  self.auth = auth(firebase);

  self.auth.on('login', () => {
    self.db = self.db || db(firebase, deviceKey);
    self.emit('login', self.db);
  });

  self.auth.on('authorizationPending', (status) => {
    self.emit('authorizationPending', status);
  });
}

inherits(FirebaseBackend, EventEmitter);

FirebaseBackend.prototype.stop = function stop() {
  if (this.db) this.db.stop();
  this.auth.stop();
};

module.exports = FirebaseBackend;
