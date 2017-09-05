const Backend = require('./backend');
const firebase = require('firebase');
const { EventEmitter } = require('events');
const config = require('../config');

jest.mock('./auth');
jest.mock('./db');

const Auth = require('./auth');
const Db = require('./db');

const auth = new EventEmitter();
Auth.mockReturnValue(auth);

const db = {};
Db.mockReturnValue(db);

const deviceKey = 'device key';

beforeEach(() => {
  Db.mockClear();

  config.getSync = jest.fn();
  firebase.initializeApp = jest.fn();
});

test('backend initializes firebase', () => {
  const firebaseConfig = {};

  config.getSync.mockReturnValue(firebaseConfig);

  const backend = Backend(deviceKey);

  expect(config.getSync).toHaveBeenCalledWith('firebaseConfig');
  expect(firebase.initializeApp).toHaveBeenCalledWith(firebaseConfig);
  expect(Auth).toHaveBeenCalledWith(firebase);
  expect(backend.auth).toBe(auth);
});

test('on authorization backend provides a database interface', () => {
  const backend = Backend(deviceKey);

  backend.emit = jest.fn();

  backend.auth.emit('login');

  expect(Db).toHaveBeenCalledWith(firebase, deviceKey);
  expect(backend.db).toBe(db);
  expect(backend.emit).toHaveBeenCalledWith('login', db);
});

test('on reauthorization the backend provides the same singleton database interface', () => {
  const backend = Backend(deviceKey);

  backend.emit = jest.fn();

  backend.auth.emit('login');
  backend.auth.emit('login');

  expect(Db).toHaveBeenCalledWith(firebase, deviceKey);
  expect(Db).toHaveBeenCalledTimes(1);
  expect(backend.db).toBe(db);
  expect(backend.emit).toHaveBeenCalledWith('login', db);
  expect(backend.emit).toHaveBeenCalledTimes(2);
});

test('stop stops the authorization module', () => {
  const dbStop = jest.fn();
  auth.stop = jest.fn();

  const backend = Backend(deviceKey);

  backend.stop();

  expect(dbStop).not.toHaveBeenCalled();
  expect(auth.stop).toHaveBeenCalled();
});

test('stop stops the database module if it exists', () => {
  const dbStop = jest.fn();
  auth.stop = jest.fn();

  const backend = Backend(deviceKey);
  backend.db = {};
  backend.db.stop = dbStop;

  backend.stop();

  expect(dbStop).toHaveBeenCalled();
  expect(auth.stop).toHaveBeenCalled();
});
