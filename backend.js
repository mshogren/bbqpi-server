const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const config = require('./backendConfig.js');
const firebase = require('firebase');
const auth = require('./auth.js');
const db = require('./db.js');

function FirebaseBackend() {
  if (!(this instanceof FirebaseBackend)) return new FirebaseBackend();

  EventEmitter.call(this);

  const self = this;

  firebase.initializeApp(config.firebase);

  self.auth = auth(firebase, config.googleOAuth);

  self.auth.on('login', () => {
    self.db = db(firebase);
    self.emit('login', self.db);
  });
}

inherits(FirebaseBackend, EventEmitter);

FirebaseBackend.prototype.stop = function stop() {
  if (this.db) this.db.stop();
  this.auth.stop();
};

module.exports = FirebaseBackend;
