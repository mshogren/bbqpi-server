const gpio = require('./gpio');
const gpioutil = require('pi-gpioutil');

test('writeGPIO returns the value written', () => {
  gpioutil.pwm = jest.fn();

  gpio.writeGPIO(2, 512).then((actual) => {
    expect(gpioutil.pwm).toHaveBeenCalledWith(2, 512);
    expect(actual).toEqual(512);
  });
});

test('writeGPIO throws an error', () => {
  gpioutil.pwm = jest.fn((pin, value, cb) => cb('writeGPIO error'));

  return gpio.writeGPIO(2, 512).catch((err) => {
    expect(err).toEqual('writeGPIO error');
  });
});

test('setGPIOMode returns the pin number', () => {
  gpioutil.mode = jest.fn();

  gpio.setGPIOMode(2).then((actual) => {
    expect(gpioutil.mode).toHaveBeenCalledWith(2, 'pwm');
    expect(actual).toEqual(2);
  });
});

test('setGPIOMode throws an error', () => {
  gpioutil.mode = jest.fn((pin, value, cb) => cb('setGPIOMode error'));

  return gpio.setGPIOMode(2).catch((err) => {
    expect(err).toEqual('setGPIOMode error');
  });
});
