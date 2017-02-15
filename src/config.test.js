const config = require('./config');

describe('The config object', () => {
  test('is named config and stores objects prettily in a single file', () => {
    expect(config).toMatchObject({
      name: 'config',
      _single: true,
      _pretty: true,
    });
  });
});
