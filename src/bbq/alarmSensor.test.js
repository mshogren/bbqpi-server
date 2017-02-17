const AlarmSensor = require('./alarmSensor');
const Sensor = require('./sensor');

const sensorData = {
  channel: 2,
  name: 'Alarm Sensor',
  alarmEnabled: false,
  alarmTemperature: 42,
};

test('alarmSensor initializes and listens for state changes', () => {
  Sensor.prototype.start = jest.fn();

  const alarmSensor = AlarmSensor(sensorData);

  expect(alarmSensor).toMatchObject({
    alarmEnabled: false,
    alarmTemperature: 42,
    sensor: {
      channel: 2,
      state: {
        name: 'Alarm Sensor',
      },
    },
  });

  expect(alarmSensor.sensor.start).toHaveBeenCalled();
});

test('alarmSensor reacts to sensor emissions', () => {
  const alarmSensor = AlarmSensor(sensorData);
  alarmSensor.emit = jest.fn();
  alarmSensor.checkAlarm = jest.fn();

  const data = { currentTemperature: 22, otherData: true };

  alarmSensor.sensor.emit('temperatureChange', data);

  expect(alarmSensor.emit).toHaveBeenCalledWith('temperatureChange', data);
  expect(alarmSensor).toMatchObject({
    currentTemperature: 22,
  });
  expect(alarmSensor.checkAlarm).toHaveBeenCalled();
});

describe('checkAlarm', () => {
  test('when alarm is not enabled', () => {
    const alarmSensor = AlarmSensor(sensorData);
    alarmSensor.emit = jest.fn();

    alarmSensor.checkAlarm();

    expect(alarmSensor.emit).not.toHaveBeenCalled();
  });


  test('when current temperature is not defined', () => {
    sensorData.alarmEnabled = true;
    const alarmSensor = AlarmSensor(sensorData);
    alarmSensor.emit = jest.fn();

    alarmSensor.checkAlarm();

    expect(alarmSensor.emit).not.toHaveBeenCalled();
  });

  test('when current temperature less than alarm temperature', () => {
    sensorData.alarmEnabled = true;
    const alarmSensor = AlarmSensor(sensorData);
    alarmSensor.currentTemperature = 22;
    alarmSensor.emit = jest.fn();

    alarmSensor.checkAlarm();

    expect(alarmSensor.emit).not.toHaveBeenCalled();
  });

  test('when current temperature greater than alarm temperature', () => {
    sensorData.alarmEnabled = true;
    const alarmSensor = AlarmSensor(sensorData);
    alarmSensor.currentTemperature = 52;
    alarmSensor.emit = jest.fn();

    alarmSensor.checkAlarm();

    expect(alarmSensor.emit).toHaveBeenCalledWith('alarm', {
      channel: 2,
      name: 'Alarm Sensor',
      alarmEnabled: true,
      alarmTemperature: 42,
      currentTemperature: 52,
    });
  });

  test('when current temperature equal to alarm temperature', () => {
    sensorData.alarmEnabled = true;
    const alarmSensor = AlarmSensor(sensorData);
    alarmSensor.currentTemperature = 42;
    alarmSensor.emit = jest.fn();

    alarmSensor.checkAlarm();

    expect(alarmSensor.emit).toHaveBeenCalledWith('alarm', {
      channel: 2,
      name: 'Alarm Sensor',
      alarmEnabled: true,
      alarmTemperature: 42,
      currentTemperature: 42,
    });
  });
});

test('getChannel gets the channel', () => {
  const alarmSensor = AlarmSensor(sensorData);
  expect(alarmSensor.getChannel()).toEqual(2);
});

test('updateSensor updates the sensor and checks the alarm', () => {
  const alarmSensor = AlarmSensor(sensorData);
  alarmSensor.checkAlarm = jest.fn();

  const newSensorData = {
    channel: 3,
    name: 'New Alarm Sensor',
    alarmEnabled: true,
    alarmTemperature: 72,
  };

  alarmSensor.updateSensor(newSensorData);

  expect(alarmSensor).toMatchObject({
    alarmEnabled: true,
    alarmTemperature: 72,
    sensor: {
      channel: 2,
      state: {
        name: 'New Alarm Sensor',
      },
    },
  });

  expect(alarmSensor.checkAlarm).toHaveBeenCalled();
});

test('stop stops the sensor from reading', () => {
  const alarmSensor = AlarmSensor(sensorData);
  alarmSensor.sensor.stop = jest.fn();

  alarmSensor.stop();

  expect(alarmSensor.sensor.stop).toHaveBeenCalled();
});
