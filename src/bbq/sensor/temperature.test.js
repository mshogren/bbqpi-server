const calculator = require('./temperature');

describe('When calculating temperatures for the TMP36 sensor', () => {
  const testCase = (value, expectedResult) => ({
    value,
    expectedResult,
  });

  const expectFunc = reading => (
    expect(calculator.calculateTemperatureTMP36(reading))
  );

  const expectCall = reading => (
    expect(() => (
      calculator.calculateTemperatureTMP36(reading)
    ))
  );

  [undefined, null].forEach((reading) => {
    test(`if the reading is ${reading} throw an error`, () => {
      expectCall(reading).toThrow();
    });
  });

  [undefined, NaN].forEach((value) => {
    test(`if the reading value is ${value} return NaN`, () => {
      expectFunc({ value }).toEqual(NaN);
    });
  });

  [
    testCase(0, -58),
    testCase(0.21, 66.74),
    testCase(1, 536),
  ].forEach(({ value, expectedResult }) => {
    test(`if the reading value is ${value} return ${expectedResult}`, () => {
      expectFunc({ value }).toBeCloseTo(expectedResult);
    });
  });
});

describe('When calculating temperatures for the TX-1000 series sensor', () => {
  const testCase = (rawValue, expectedResult) => ({
    rawValue,
    expectedResult,
  });

  const expectFunc = reading => (
    expect(calculator.calculateTemperatureTX1000(reading))
  );

  const expectCall = reading => (
    expect(() => (
      calculator.calculateTemperatureTX1000(reading)
    ))
  );

  [undefined, null].forEach((reading) => {
    test(`if the reading is ${reading} throw an error`, () => {
      expectCall(reading).toThrow();
    });
  });

  [undefined, NaN].forEach((rawValue) => {
    test(`if the reading raw value is ${rawValue} return NaN`, () => {
      expectFunc({ rawValue }).toEqual(NaN);
    });
  });

  [
    testCase(0, -459.67),
    testCase(1023, -459.67),
    testCase(1, -69.76),
    testCase(633, 211.94),
    testCase(1022, 1006.71),
  ].forEach(({ rawValue, expectedResult }) => {
    test(`if the reading raw value is ${rawValue} return ${expectedResult}`, () => {
      expectFunc({ rawValue }).toBeCloseTo(expectedResult, 2);
    });
  });
});
