const TargetSensor = require('./targetSensor');
const Sensor = require('./sensor');
const gpioutil = require('pi-gpioutil');

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

  expect(targetSensor).toMatchObject({
    state: {
      currentTemperature: 235,
    },
  });

  expect(targetSensor.emitState).toHaveBeenCalled();
});

describe('emitState', () => {
  test('when current temperature is below target', () => {
    const targetSensor = TargetSensor();
    targetSensor.target = 225;
    targetSensor.state = { currentTemperature: 215 };
    targetSensor.setFan = jest.fn();
    targetSensor.onSetFan = jest.fn();

    targetSensor.emitState();

    expect(targetSensor.setFan).toHaveBeenCalledWith(true, targetSensor.onSetFan);
  });

  test('when current temperature is above target', () => {
    const targetSensor = TargetSensor();
    targetSensor.target = 225;
    targetSensor.state = { currentTemperature: 235 };
    targetSensor.setFan = jest.fn();
    targetSensor.onSetFan = jest.fn();

    targetSensor.emitState();

    expect(targetSensor.setFan).toHaveBeenCalledWith(false, targetSensor.onSetFan);
  });

  test('when current temperature is equal to target', () => {
    const targetSensor = TargetSensor();
    targetSensor.target = 225;
    targetSensor.state = { currentTemperature: 225 };
    targetSensor.setFan = jest.fn();
    targetSensor.onSetFan = jest.fn();

    targetSensor.emitState();

    expect(targetSensor.setFan).toHaveBeenCalledWith(false, targetSensor.onSetFan);
  });
});

describe('setFan', () => {
  [true, false].forEach((isFanOn) => {
    test(`when is fan on equals ${isFanOn} and there is no callback`, () => {
      const targetSensor = TargetSensor();
      gpioutil.write = jest.fn();

      targetSensor.setFan(isFanOn);

      expect(gpioutil.write)
        .toHaveBeenCalledWith(24, isFanOn, targetSensor.onGPIOWrite(undefined, isFanOn));
    });
  });

  [true, false].forEach((isFanOn) => {
    test(`when is fan on equals ${isFanOn} and there is a callback`, () => {
      const targetSensor = TargetSensor();
      gpioutil.write = jest.fn();
      const callback = jest.fn();

      targetSensor.setFan(isFanOn, callback);

      expect(gpioutil.write)
        .toHaveBeenCalledWith(24, isFanOn, targetSensor.onGPIOWrite(callback, isFanOn));
    });
  });
});

describe('onGPIOWrite', () => {
  [true, false].forEach((isFanOn) => {
    test('when an error has occured', () => {
      const targetSensor = TargetSensor();
      const callback = jest.fn();

      expect(() => targetSensor.onGPIOWrite(callback, isFanOn, 'GPIO write error')).toThrow();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  [true, false].forEach((isFanOn) => {
    test('when there is no callback', () => {
      const targetSensor = TargetSensor();
      const callback = jest.fn();

      targetSensor.onGPIOWrite(undefined, isFanOn);

      expect(callback).not.toHaveBeenCalled();
    });
  });

  [true, false].forEach((isFanOn) => {
    test('when there is a callback', () => {
      const targetSensor = TargetSensor();
      const callback = jest.fn();

      targetSensor.onGPIOWrite(callback, isFanOn);

      expect(callback).toHaveBeenCalledWith(isFanOn);
    });
  });
});

describe('onSetFan', () => {
  [true, false].forEach((isFanOn) => {
    test(`when is fan on equals ${isFanOn}`, () => {
      const targetSensor = TargetSensor();
      targetSensor.target = 225;
      targetSensor.state = { otherState: true };
      targetSensor.emit = jest.fn();

      targetSensor.onSetFan(isFanOn);

      expect(targetSensor.emit).toHaveBeenCalledWith('temperatureChange', {
        fan: isFanOn,
        targetTemperature: 225,
        otherState: true,
      });

      expect(targetSensor.state).toMatchObject({
        fan: isFanOn,
        targetTemperature: 225,
        otherState: true,
      });
    });
  });
});

test('getChannel gets the channel', () => {
  const targetSensor = TargetSensor();
  expect(targetSensor.getChannel()).toEqual(0);
});

test('setTarget sets the targt and emits a message', () => {
  const targetSensor = TargetSensor();
  targetSensor.emitState = jest.fn();

  targetSensor.setTarget(250);

  expect(targetSensor).toMatchObject({
    sensor: {
      channel: 0,
    },
    target: 250,
  });

  expect(targetSensor.emitState).toHaveBeenCalled();
});

test('stop turns off the fan and stops the sensor from reading', () => {
  const targetSensor = TargetSensor();
  targetSensor.setFan = jest.fn();
  targetSensor.sensor.stop = jest.fn();

  targetSensor.stop();

  expect(targetSensor.setFan).toHaveBeenCalledWith(false);
  expect(targetSensor.sensor.stop).toHaveBeenCalled();
});
