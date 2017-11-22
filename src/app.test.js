const { EventEmitter } = require('events');

jest.mock('./http');
jest.mock('./bbq');
jest.mock('./push');
jest.mock('./backend');

const Http = require('./http');
const Bbq = require('./bbq');
const Pusher = require('./push');
const Backend = require('./backend');

const http = new EventEmitter();
Http.mockReturnValue(http);

const bbq = new EventEmitter();
Bbq.mockReturnValue(bbq);

Pusher.mockReturnValue({ publicKey: 'public key' });

const backend = new EventEmitter();
Backend.mockReturnValue(backend);

const db = new EventEmitter();
db.addState = jest.fn();
db.processSubscriptions = jest.fn();
db.getPreviousStates = jest.fn();

console.log = jest.fn();

require('./app')();

test('when backend is authorized event listeners are setup', () => {
  http.setDeviceStatus = jest.fn();
  bbq.isFanControllerInitialized = jest.fn();
  bbq.isFanControllerInitialized.mockReturnValueOnce(true);
  db.getPreviousStates.mockClear();

  expect(bbq.eventNames()).toEqual([]);

  backend.emit('login', db);

  expect(bbq.isFanControllerInitialized).toHaveBeenCalled();
  expect(db.getPreviousStates).toHaveBeenCalled();

  const bbqEvents = ['temperatureChange', 'alarm'];
  expect(bbq.eventNames()).toEqual(bbqEvents);
  bbqEvents.forEach(eventName => expect(bbq.listenerCount(eventName)).toEqual(1));

  const dbEvents = ['setTargetTemperature', 'addSensor', 'updateSensor', 'removeSensor'];
  expect(db.eventNames()).toEqual(dbEvents);
  dbEvents.forEach(eventName => expect(db.listenerCount(eventName)).toEqual(1));
});

test('when backend is reauthorized event listeners are not duplicated', () => {
  http.setDeviceStatus = jest.fn();
  bbq.isFanControllerInitialized = jest.fn();
  bbq.isFanControllerInitialized.mockReturnValueOnce(true);
  bbq.isFanControllerInitialized.mockReturnValueOnce(false);
  db.getPreviousStates.mockClear();

  backend.emit('login', db);
  backend.emit('login', db);

  expect(bbq.isFanControllerInitialized).toHaveBeenCalledTimes(2);
  expect(db.getPreviousStates).toHaveBeenCalledTimes(1);

  const bbqEvents = ['temperatureChange', 'alarm'];
  expect(bbq.eventNames()).toEqual(bbqEvents);
  bbqEvents.forEach(eventName => expect(bbq.listenerCount(eventName)).toEqual(1));

  const dbEvents = ['setTargetTemperature', 'addSensor', 'updateSensor', 'removeSensor'];
  expect(db.eventNames()).toEqual(dbEvents);
  dbEvents.forEach(eventName => expect(db.listenerCount(eventName)).toEqual(1));
});

describe('when backend is authorized and listeners setup', () => {
  beforeEach(() => {
    backend.emit('login', db);
  });

  test('when a temperature change is detected add a state record to the database', () => {
    const data = {};
    bbq.emit('temperatureChange', data);

    expect(db.addState).toHaveBeenCalledWith(data);
  });

  test('when an alarm is detected send push notifications', () => {
    const alarmData = {};
    bbq.emit('alarm', alarmData);

    expect(db.processSubscriptions).toHaveBeenCalled();
  });

  test('when a target temperature is set in the database, set it on the bbq controller', () => {
    bbq.setTarget = jest.fn();

    db.emit('setTargetTemperature', 225);

    expect(bbq.setTarget).toHaveBeenCalledWith(225);
  });

  test('when a sensor is added in the database, add it to the bbq controller', () => {
    bbq.addSensor = jest.fn();

    const sensorData = {};
    db.emit('addSensor', sensorData);

    expect(bbq.addSensor).toHaveBeenCalledWith(sensorData);
  });

  test('when a sensor is updated in the database, update the bbq controller', () => {
    bbq.updateSensor = jest.fn();

    const sensorData = {};
    db.emit('updateSensor', sensorData);

    expect(bbq.updateSensor).toHaveBeenCalledWith(sensorData);
  });

  test('when a sensor is removed in the database, remove it from the bbq controller', () => {
    bbq.removeSensor = jest.fn();

    const sensorData = {};
    db.emit('removeSensor', sensorData);

    expect(bbq.removeSensor).toHaveBeenCalledWith(sensorData);
  });
});
