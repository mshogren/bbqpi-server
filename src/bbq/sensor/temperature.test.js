const calculator = require('./temperature');

describe('When calculating temperatures for the TMP36 sensor', () => {
  const testCase = (value, expectedResult) => ({
    value,
    expectedResult,
  });

  const expectFunc = (reading) =>
    expect(calculator.calculateTemperatureTMP36(reading));

  [undefined, NaN].forEach((value) => {
    test(`if the reading value is ${value} return NaN`, () => {
      expectFunc(value).toEqual(NaN);
    });
  });

  [testCase(0, -58), testCase(0.21 * 1023, 66.74), testCase(1023, 536)].forEach(
    ({ value, expectedResult }) => {
      test(`if the reading value is ${value} return ${expectedResult}`, () => {
        expectFunc(value).toBeCloseTo(expectedResult);
      });
    }
  );
});

describe('When calculating temperatures for the TX-1000 series sensor', () => {
  const testCase = (value, expectedResult) => ({
    value,
    expectedResult,
  });

  const expectFunc = (reading) =>
    expect(calculator.calculateTemperatureTX1000(reading));

  [undefined, NaN].forEach((value) => {
    test(`if the reading raw value is ${value} return NaN`, () => {
      expectFunc(value).toEqual(NaN);
    });
  });

  [
    testCase(0, -459.67),
    testCase(1023, -459.67),
    testCase(1, -69.76),
    testCase(633, 211.94),
    testCase(1022, 1006.71),
  ].forEach(({ value, expectedResult }) => {
    test(`if the reading raw value is ${value} return ${expectedResult}`, () => {
      expectFunc(value).toBeCloseTo(expectedResult, 2);
    });
  });
});
