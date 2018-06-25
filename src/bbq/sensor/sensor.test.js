const mcpadc = require('mcp-spi-adc');
const Sensor = require('./sensor');
const calculator = require('./temperature');

describe('Sensor constructor', () => {
  test('with a name', () => {
    const sensor = Sensor(0, 'name');

    expect(sensor).toMatchObject({
      channel: 0,
      state: {
        channel: 0,
        name: 'name',
      },
    });
  });

  test('with no name', () => {
    const sensor = Sensor(1);

    expect(sensor).toMatchObject({
      channel: 1,
      state: {
        channel: 1,
      },
    });
    expect(sensor.state.name).not.toBeDefined();
  });

  test('with null name', () => {
    const sensor = Sensor(1, null);

    expect(sensor).toMatchObject({
      channel: 1,
      state: {
        channel: 1,
      },
    });
    expect(sensor.state.name).not.toBeDefined();
  });
});

test('start attempts to open the channel', () => {
  const sensor = Sensor(1);

  mcpadc.open = jest.fn();
  sensor.onChannelOpen = jest.fn();

  sensor.start();

  expect(mcpadc.open).toHaveBeenCalledWith(
    1,
    { speedHz: 20000 },
    sensor.onChannelOpen
  );
});

describe('when opening a channel', () => {
  test('if an error occurs throw it', () => {
    jest.useFakeTimers();

    const sensor = Sensor(1);
    const tempSensor = jest.fn();

    mcpadc.open = jest.fn();
    mcpadc.open.mockReturnValue(tempSensor);

    sensor.readSensorData = jest.fn();

    expect(() => sensor.onChannelOpen('error')).toThrow();
  });

  test('if no error occurs start reading data from the channel', () => {
    jest.useFakeTimers();

    const sensor = Sensor(1);
    const tempSensor = jest.fn();

    mcpadc.open = jest.fn();
    mcpadc.open.mockReturnValue(tempSensor);

    sensor.readSensorData = jest.fn();

    sensor.onChannelOpen();

    expect(setInterval).toHaveBeenCalledWith(sensor.readSensorData, 3000);
  });
});

test('attempt to read the channel data', () => {
  const sensor = Sensor(1);
  sensor.tempSensor = jest.fn();
  sensor.tempSensor.read = jest.fn();
  sensor.onReadSensorData = jest.fn();

  sensor.readSensorData();

  expect(sensor.tempSensor.read).toHaveBeenCalledWith(sensor.onReadSensorData);
});

describe('when reading channel data', () => {
  test('if an error occurs throw it', () => {
    const sensor = Sensor(1);

    expect(() => sensor.onReadSensorData('error')).toThrow();
  });

  test('if the temperature is unchanged', () => {
    const sensor = Sensor(1);
    sensor.state.currentTemperature = 42;

    sensor.calculateTemperature = jest.fn();
    sensor.calculateTemperature.mockReturnValue(42);

    sensor.emit = jest.fn();

    const reading = {};

    sensor.onReadSensorData(undefined, reading);

    expect(sensor.calculateTemperature).toHaveBeenCalledWith(reading);
    expect(sensor).toMatchObject({
      state: {
        currentTemperature: 42,
      },
    });
    expect(sensor.emit).not.toHaveBeenCalled();
  });

  test('if the temperature has changed', () => {
    const sensor = Sensor(1);

    sensor.calculateTemperature = jest.fn();
    sensor.calculateTemperature.mockReturnValue(72);

    sensor.emit = jest.fn();

    const reading = {};

    sensor.onReadSensorData(undefined, reading);

    expect(sensor.calculateTemperature).toHaveBeenCalledWith(reading);
    expect(sensor).toMatchObject({
      state: {
        currentTemperature: 72,
      },
    });
    expect(sensor.emit).toHaveBeenCalledWith('temperatureChange', {
      channel: 1,
      currentTemperature: 72,
    });
  });
});

describe('calculateTemperature', () => {
  calculator.calculateTemperatureTMP36 = jest.fn();
  calculator.calculateTemperatureTX1000 = jest.fn();

  beforeEach(() => {
    calculator.calculateTemperatureTMP36.mockReset();
    calculator.calculateTemperatureTX1000.mockReset();
  });

  test('uses the TMP36 algorithm for channel 0', () => {
    const sensor = Sensor(0);
    const reading = {};

    sensor.calculateTemperature(reading);

    expect(calculator.calculateTemperatureTMP36).toHaveBeenCalledWith(reading);
    expect(calculator.calculateTemperatureTX1000).not.toHaveBeenCalled();
  });

  test('uses the TX1000 algorithm for other channels', () => {
    const sensor = Sensor(1);
    const reading = {};

    sensor.calculateTemperature(reading);

    expect(calculator.calculateTemperatureTMP36).not.toHaveBeenCalled();
    expect(calculator.calculateTemperatureTX1000).toHaveBeenCalledWith(reading);
  });
});

test('getChannel gets the channel', () => {
  const sensor = Sensor(2);
  expect(sensor.getChannel()).toEqual(2);
});

test('getName gets the name', () => {
  const sensor = Sensor(3, 'name');
  expect(sensor.getName()).toEqual('name');
});

test('setName sets the name', () => {
  const sensor = Sensor(4, 'name');
  sensor.setName('newName');

  expect(sensor).toMatchObject({
    state: {
      name: 'newName',
    },
  });
});

test('stop clears the interval', () => {
  jest.useFakeTimers();

  const sensor = Sensor(4, 'name');
  sensor.stop();

  expect(clearInterval).toHaveBeenCalled();
});
