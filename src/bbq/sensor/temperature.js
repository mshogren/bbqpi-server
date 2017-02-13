exports.calculateTemperatureTMP36 = (reading) => {
  const celcius = ((reading.value * 3.3) - 0.5) * 100;
  const fahrenheit = (celcius * 1.8) + 32;

  return fahrenheit;
};

exports.calculateTemperatureTX1000 = (reading) => {
  const R = 1e+4 * ((1023.0 / reading.rawValue) - 1.0);
  const lnR = Math.log(R);

  const kelvin = 1.0 / ((((lnR * lnR * 1.3193731e-7) + 2.0959138e-4) * lnR) + 7.6253948e-4);
  const celcius = kelvin - 273.15;
  const fahrenheit = (celcius * 1.8) + 32;

  return fahrenheit;
};
