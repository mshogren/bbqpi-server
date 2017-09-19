const TargetSensor = require('./targetSensor');
const Sensor = require('./sensor');

test('targetSensor initializes and listens for state changes', () => {
  Sensor.prototype.start = jest.fn();

  const targetSensor = TargetSensor();

  expect(targetSensor).toMatchObject({
    sensor: {
      channel: 0,
    },
  });

  expect(targetSensor.sensor.start).toHaveBeenCalled();
});

test('targetSensor reacts to sensor emissions', () => {
  const targetSensor = TargetSensor();
  targetSensor.emitState = jest.fn();

  const data = {
    currentTemperature: 235,
    otherData: true,
  };

  targetSensor.sensor.emit('temperatureChange', data);

  expect(targetSensor.emitState).toHaveBeenCalledWith(data);
});

test('targetSensor reacts to fan controller emissions', () => {
  const targetSensor = TargetSensor();
  targetSensor.emitState = jest.fn();

  const data = {
    targetTemperature: 235,
    fanLevel: 512,
    otherData: true,
  };

  targetSensor.fan.emit('fanChange', data);

  expect(targetSensor.emitState).toHaveBeenCalledWith(data);
});

test('emitState merges the supplied data with the current state and emits it', () => {
  const targetSensor = TargetSensor();
  targetSensor.emit = jest.fn();

  targetSensor.state = {
    unchangedProperty: 'unchanged',
    changedProperty: 'initial',
  };

  const data = {
    changedProperty: 'changed',
    newProperty: 'new',
  };

  const expected = {
    unchangedProperty: 'unchanged',
    changedProperty: 'changed',
    newProperty: 'new',
  };

  targetSensor.emitState(data);

  expect(targetSensor.state).toMatchObject(expected);
  expect(targetSensor.emit).toHaveBeenCalledWith('temperatureChange', expected);
});

test('getChannel gets the channel', () => {
  const targetSensor = TargetSensor();
  expect(targetSensor.getChannel()).toEqual(0);
});


[true, false].forEach((isInitialized) => {
  test(`isFanControllerInitialized when fan controller initialized is ${isInitialized}`, () => {
    const targetSensor = TargetSensor();
    targetSensor.fan.isInitialized = jest.fn(() => (isInitialized));

    const actual = targetSensor.isFanControllerInitialized();

    expect(targetSensor.fan.isInitialized).toHaveBeenCalled();
    expect(actual).toEqual(isInitialized);
  });
});

test('initializeFanController initializes the fan controller', () => {
  const targetSensor = TargetSensor();
  targetSensor.fan.initialize = jest.fn();

  const states = { state1: 1, state2: 2 };

  targetSensor.initializeFanController(states);

  expect(targetSensor.fan.initialize).toHaveBeenCalledWith(states);
});

test('setTarget sets the target on the fan controller', () => {
  const targetSensor = TargetSensor();
  targetSensor.fan = jest.fn();
  targetSensor.fan.setTarget = jest.fn();

  targetSensor.setTarget(250);

  expect(targetSensor.fan.setTarget).toHaveBeenCalledWith(250);
});

test('stop turns off the fan and stops the sensor from reading', () => {
  const targetSensor = TargetSensor();
  targetSensor.fan.stop = jest.fn();
  targetSensor.sensor.stop = jest.fn();

  targetSensor.stop();

  expect(targetSensor.fan.stop).toHaveBeenCalled();
  expect(targetSensor.sensor.stop).toHaveBeenCalled();
});
