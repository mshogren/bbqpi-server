const BBQController = require('./bbq');
const Sensor = require('./sensor');
const EventEmitter = require('events').EventEmitter;

jest.mock('./targetSensor');
jest.mock('./alarmSensor');

const TargetSensor = require('./targetSensor');
const AlarmSensor = require('./alarmSensor');

Sensor.prototype.start = jest.fn();

test('BBQController initializes with one target sensor', () => {
  const targetSensor = new TargetSensor();
  targetSensor.on = jest.fn();

  TargetSensor.mockReturnValue(targetSensor);

  const bbq = BBQController();

  expect(bbq.sensors.length).toEqual(1);
  expect(bbq.targetSensor).toBeDefined();
});

test('BBQController reacts to temperature changes on target sensor', () => {
  const targetSensor = new EventEmitter();

  TargetSensor.mockReturnValue(targetSensor);

  const bbq = BBQController();
  bbq.emit = jest.fn();

  bbq.targetSensor.emit('temperatureChange', { state: 'state' });

  expect(bbq.emit).toHaveBeenCalledWith('temperatureChange', { state: 'state' });
});

test('setTarget sets the target temperature on the target sensor', () => {
  const bbq = BBQController();

  bbq.targetSensor.setTarget = jest.fn();

  bbq.setTarget(250);

  expect(bbq.targetSensor.setTarget).toHaveBeenCalledWith(250);
});

test('addSensor adds a sensor', () => {
  const alarmSensor = new AlarmSensor({ channel: 2 });
  alarmSensor.on = jest.fn();

  AlarmSensor.mockReturnValue(alarmSensor);

  const bbq = BBQController();

  const sensorData = {
    channel: 2,
    otherSensorData: true,
  };

  bbq.addSensor(sensorData);

  expect(bbq.sensors.length).toEqual(2);
});

test('BBQController reacts to temperature changes on added sensor', () => {
  const alarmSensor = new EventEmitter();

  AlarmSensor.mockReturnValue(alarmSensor);

  const bbq = BBQController();
  bbq.emit = jest.fn();

  bbq.addSensor({ channel: 3 });
  bbq.sensors[1].emit('temperatureChange', { state: true });

  expect(bbq.emit).toHaveBeenCalledWith('temperatureChange', { state: true });
});

test('BBQController reacts to alarms on added sensor', () => {
  const alarmSensor = new EventEmitter();

  AlarmSensor.mockReturnValue(alarmSensor);

  const bbq = BBQController();
  bbq.emit = jest.fn();

  bbq.addSensor({ channel: 3 });
  bbq.sensors[1].emit('alarm', { alarmData: 'alarm data' });

  expect(bbq.emit).toHaveBeenCalledWith('alarm', { alarmData: 'alarm data' });
});

test('updateSensor updates the sensor with the given channel', () => {
  const bbq = BBQController();

  bbq.sensors[0].getChannel = jest.fn().mockReturnValue(0);

  [2, 1, 3].forEach((channel) => {
    const sensor = new AlarmSensor({ channel });
    sensor.getChannel = jest.fn().mockReturnValue(channel);
    sensor.updateSensor = jest.fn();
    bbq.sensors.push(sensor);
  });

  bbq.updateSensor({ channel: 1, otherSensorData: true });

  expect(bbq.sensors[2].updateSensor).toHaveBeenCalledWith({ channel: 1, otherSensorData: true });
});

test('removeSensor stops the sensor with the given channel and removes it from the collection', () => {
  const bbq = BBQController();

  bbq.sensors[0].getChannel = jest.fn().mockReturnValue(0);

  [2, 1, 3].forEach((channel) => {
    const sensor = new AlarmSensor({ channel });
    sensor.getChannel = jest.fn().mockReturnValue(channel);
    bbq.sensors.push(sensor);
  });

  const stopMock = jest.fn();
  bbq.sensors[2].stop = stopMock;

  bbq.removeSensor({ channel: 1, otherSensorData: true });

  expect(stopMock).toHaveBeenCalled();
  expect(bbq.sensors.map(sensor => sensor.getChannel())).toEqual([0, 2, 3]);
});

test('stop stops all sensors in the collection', () => {
  const bbq = BBQController();

  bbq.sensors[0].stop = jest.fn();

  [2, 1, 3].forEach((channel) => {
    const sensor = new AlarmSensor({ channel });
    sensor.stop = jest.fn();
    bbq.sensors.push(sensor);
  });

  bbq.stop();

  bbq.sensors.forEach((sensor) => {
    expect(sensor.stop).toHaveBeenCalled();
  });
});
