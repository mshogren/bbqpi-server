const resin = require('./resin');

test('when not running on resin.io return undefined', () => {
  process.env = {};

  expect(resin()).toBeUndefined();
});

test('when running on resin.io return an object', () => {
  process.env = { RESIN: 1 };

  expect(resin()).toMatchObject({});
});
