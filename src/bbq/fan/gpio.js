const gpioutil = require('pi-gpioutil');

const writeGPIO = function writeGPIO(wiringPiPin, fanLevel) {
  return new Promise((resolve, reject) => {
    gpioutil.pwm(wiringPiPin, fanLevel, (err) => {
      if (err) reject(err);
      resolve(fanLevel);
    });
  });
};

const setGPIOMode = function setGPIOMode(wiringPiPin) {
  return new Promise((resolve, reject) => {
    gpioutil.mode(wiringPiPin, 'pwm', (err) => {
      if (err) reject(err);
      resolve(wiringPiPin);
    });
  });
};

const getGPIOExports = function getGPIOExports() {
  return new Promise((resolve, reject) => {
    gpioutil.exports((err, stdout, stderr, exports) => {
      if (err) reject(err);
      resolve(exports);
    });
  });
};

const exportGPIOPin = function exportGPIOPin(bcmPin) {
  return new Promise((resolve, reject) => {
    gpioutil.export(bcmPin, 'out', (err) => {
      if (err) reject(err);
      resolve(bcmPin);
    });
  });
};

const exportGPIOPinIfRequired = function exportGPIOPinIfRequired(exports, bcmPin) {
  return new Promise((resolve) => {
    if (exports.every(e => e.pin !== String(bcmPin) || e.direction !== 'out')) {
      exportGPIOPin(bcmPin).then(resolve);
    } else {
      resolve();
    }
  });
};

const checkGPIOPin = function checkGPIOPin(bcmPin) {
  return getGPIOExports()
    .then(exports => (exportGPIOPinIfRequired(exports, bcmPin)));
};

const configureGPIO = function configureGPIO(bcmPin, wiringPiPin) {
  return checkGPIOPin(bcmPin)
    .then(() => (setGPIOMode(wiringPiPin)));
};

const setPWMLevel = function setPWMLevel(fanLevel) {
  const bcmPin = 19;
  const wiringPiPin = 24;

  return configureGPIO(bcmPin, wiringPiPin)
    .then(() => (writeGPIO(wiringPiPin, fanLevel)));
};

module.exports = {
  writeGPIO,
  setGPIOMode,
  getGPIOExports,
  exportGPIOPin,
  exportGPIOPinIfRequired,
  checkGPIOPin,
  configureGPIO,
  setPWMLevel,
};
