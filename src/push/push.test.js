const pusher = require('./push');
const config = require('../config');
const webpush = require('web-push');

config.getSync = jest.fn();
config.save = jest.fn();
webpush.setVapidDetails = jest.fn();
webpush.generateVAPIDKeys = jest.fn();
webpush.sendNotification = jest.fn();

const url = 'https://dev.michael-shogren.com';

describe('The pusher constructor', () => {
  beforeEach(() => {
    config.getSync.mockReset();
  });

  test('uses VAPID keys from config if available', () => {
    const publicKey = 'publicKeyValueFromConfig';
    const privateKey = 'privateKeyValueFromConfig';

    config.getSync.mockReturnValueOnce({ publicKey, privateKey });

    expect(pusher()).toMatchObject({ publicKey });
    expect(config.getSync).toHaveBeenCalledWith('pushConfig');
    expect(config.save).not.toHaveBeenCalled();
    expect(webpush.setVapidDetails).toHaveBeenCalledWith(url, publicKey, privateKey);
  });

  test('generates VAPID keys if not in config', () => {
    const publicKey = 'generatedPublicKey';
    const privateKey = 'generatedPrivateKey';

    webpush.generateVAPIDKeys.mockReturnValueOnce({ publicKey, privateKey });

    expect(pusher()).toMatchObject({ publicKey });
    expect(config.save).toHaveBeenCalledWith('pushConfig', { publicKey, privateKey }, console.log);
    expect(webpush.setVapidDetails).toHaveBeenCalledWith(url, publicKey, privateKey);
  });
});

describe('the pusher sends notifications', () => {
  const publicKey = 'publicKeyValueFromConfig';
  const privateKey = 'privateKeyValueFromConfig';
  const subscription = {};
  const payload = 'payload';

  test('with no callback', () => {
    config.getSync.mockReturnValueOnce({ publicKey, privateKey });

    webpush.sendNotification.mockReturnValue(new Promise((resolve) => {
      resolve('returnValue');
    }));

    pusher().sendNotification(subscription, payload);

    expect(webpush.sendNotification).toHaveBeenCalledWith(subscription, payload);
  });

  test('calls the callback on success', () => {
    config.getSync.mockReturnValueOnce({ publicKey, privateKey });

    webpush.sendNotification.mockReturnValue(new Promise((resolve) => {
      resolve('returnValue');
    }));

    const callback = jest.fn();

    return pusher().sendNotification(subscription, payload, callback).then(() => {
      expect(callback).toHaveBeenCalled();
      expect(webpush.sendNotification).toHaveBeenCalledWith(subscription, payload);
    });
  });

  test('does not call the callback on failure', () => {
    config.getSync.mockReturnValueOnce({ publicKey, privateKey });

    webpush.sendNotification.mockReturnValue(new Promise((resolve, reject) => {
      reject('mock webpush error');
    }));

    const callback = jest.fn();

    return pusher().sendNotification(subscription, payload, callback)
      .then(() => {})
      .catch(() => {
        expect(callback).not.toHaveBeenCalled();
        expect(webpush.sendNotification).toHaveBeenCalledWith(subscription, payload);
      });
  });
});
