const { EventEmitter } = require('events');

jest.mock('./http');
jest.mock('./bbq');
jest.mock('./push');
jest.mock('./backend');

const Http = require('./http');
const Bbq = require('./bbq');
const Pusher = require('./push');
const Backend = require('./backend');

const http = new EventEmitter();
Http.mockReturnValue(http);

const bbq = new EventEmitter();
Bbq.mockReturnValue(bbq);

Pusher.mockReturnValue({ publicKey: 'public key' });

const backend = new EventEmitter();
Backend.mockReturnValue(backend);

const db = new EventEmitter();
db.addState = jest.fn();
db.processSubscriptions = jest.fn();
db.getPreviousStates = jest.fn();

beforeEach(() => {
  require('./server'); // eslint-disable-line global-require
});

['SIGTERM', 'SIGINT'].forEach((signal) => {
  test(`server shutsdown cleanly on ${signal}`, () => {
    bbq.stop = jest.fn();
    backend.stop = jest.fn();

    process.emit(signal);

    expect(bbq.stop).toHaveBeenCalled();
    expect(backend.stop).toHaveBeenCalled();
  });
});

