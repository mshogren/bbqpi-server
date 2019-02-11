exports.calculateTemperatureTMP36 = (reading) => {
  const celcius = ((reading / 1023.0) * 3.3 - 0.5) * 100;
  const fahrenheit = celcius * 1.8 + 32;

  return fahrenheit;
};

exports.calculateTemperatureTX1000 = (reading) => {
  const R = 1e4 * (1023.0 / reading - 1.0);
  const lnR = Math.log(R);

  const kelvin =
    1.0 / ((lnR * lnR * 9.515686e-8 + 2.157437e-4) * lnR + 7.3431401e-4);
  const celcius = kelvin - 273.15;
  const fahrenheit = celcius * 1.8 + 32;

  return fahrenheit;
};
