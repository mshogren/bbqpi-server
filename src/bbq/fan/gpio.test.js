const gpio = require('./gpio');
const gpioutil = require('pi-gpioutil');

test('writeGPIO returns the value written', () => {
  gpioutil.pwm = jest.fn((pin, value, cb) => cb());

  return gpio.writeGPIO(2, 512).then((actual) => {
    expect(gpioutil.pwm).toHaveBeenCalled();
    expect(gpioutil.pwm.mock.calls[0]).toEqual(expect.arrayContaining([2, 512]));
    expect(actual).toEqual(512);
  });
});

test('writeGPIO throws an error', () => {
  gpioutil.pwm = jest.fn((pin, value, cb) => cb('writeGPIO error'));

  return gpio.writeGPIO(2, 512).catch((err) => {
    expect(gpioutil.pwm).toHaveBeenCalled();
    expect(err).toEqual('writeGPIO error');
  });
});

test('setGPIOMode returns the pin number', () => {
  gpioutil.mode = jest.fn((pin, value, cb) => cb());

  return gpio.setGPIOMode(2).then((actual) => {
    expect(gpioutil.mode).toHaveBeenCalled();
    expect(gpioutil.mode.mock.calls[0]).toEqual(expect.arrayContaining([2, 'pwm']));
    expect(actual).toEqual(2);
  });
});

test('setGPIOMode throws an error', () => {
  gpioutil.mode = jest.fn((pin, value, cb) => cb('setGPIOMode error'));

  return gpio.setGPIOMode(2).catch((err) => {
    expect(gpioutil.mode).toHaveBeenCalled();
    expect(err).toEqual('setGPIOMode error');
  });
});

test('getGPIOExports returns the exported pins', () => {
  gpioutil.exports = jest.fn(cb => cb(null, null, null, { pin: 23 }));

  return gpio.getGPIOExports().then((actual) => {
    expect(gpioutil.exports).toHaveBeenCalled();
    expect(actual).toMatchObject({ pin: 23 });
  });
});

test('getGPIOExports throws an error', () => {
  gpioutil.exports = jest.fn(cb => cb('getGPIOExports error'));

  return gpio.getGPIOExports().catch((err) => {
    expect(gpioutil.exports).toHaveBeenCalled();
    expect(err).toEqual('getGPIOExports error');
  });
});

test('exportGPIOPin exports the pin', () => {
  gpioutil.export = jest.fn((pin, direction, cb) => cb());

  return gpio.exportGPIOPin(2).then((actual) => {
    expect(gpioutil.export).toHaveBeenCalled();
    expect(gpioutil.export.mock.calls[0]).toEqual(expect.arrayContaining([2, 'out']));
    expect(actual).toEqual(2);
  });
});

test('exportGPIOPin throws an error', () => {
  gpioutil.export = jest.fn((pin, direction, cb) => cb('exportGPIOPin error'));

  return gpio.exportGPIOPin(2).catch((err) => {
    expect(gpioutil.export).toHaveBeenCalled();
    expect(err).toEqual('exportGPIOPin error');
  });
});
