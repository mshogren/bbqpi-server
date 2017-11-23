jest.mock('./resin');

const resin = require('./resin');
const config = require('./config');

describe('The config object', () => {
  test('is named config and stores objects prettily in a single file', () => {
    resin.mockReturnValue(undefined);

    expect(config()).toMatchObject({
      store: {
        name: 'config/config',
        _single: true,
        _pretty: true,
      },
    });
  });

  test('throws an access exception', () => {
    resin.mockReturnValue({ resin: 'resin' });

    expect(() => config()).toThrow('config store error');
  });
});
