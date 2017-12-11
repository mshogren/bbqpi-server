const webpush = require('web-push');
const config = require('../config');

function WebPush() {
  if (!(this instanceof WebPush)) return new WebPush();

  let pushConfig = config.store.getSync('pushConfig');

  if (!pushConfig || !pushConfig.publicKey) pushConfig = undefined;

  const { publicKey, privateKey } = pushConfig || webpush.generateVAPIDKeys();

  if (!pushConfig) {
    config.store.save('pushConfig', { publicKey, privateKey }, console.log);
  }

  this.publicKey = publicKey;

  const url = 'https://dev.michael-shogren.com';
  webpush.setVapidDetails(url, publicKey, privateKey);
}

WebPush.prototype.sendNotification = function sendNotification(
  subscription,
  payload,
  callback
) {
  return webpush
    .sendNotification(subscription, payload)
    .then(callback)
    .catch(console.log);
};

module.exports = WebPush;
