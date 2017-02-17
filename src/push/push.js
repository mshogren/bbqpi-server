const webpush = require('web-push');
const config = require('../config');

function WebPush() {
  if (!(this instanceof WebPush)) return new WebPush();

  const pushConfig = config.getSync('pushConfig');

  const { publicKey, privateKey } = pushConfig || webpush.generateVAPIDKeys();

  if (!pushConfig) {
    config.save('pushConfig', { publicKey, privateKey }, console.log);
  }

  this.publicKey = publicKey;

  const url = 'https://dev.michael-shogren.com';
  webpush.setVapidDetails(url, publicKey, privateKey);
}

WebPush.prototype.sendNotification = function sendNotification(subscription, payload, callback) {
  return webpush.sendNotification(subscription, payload)
    .then(callback)
    .catch(console.log);
};

module.exports = WebPush;
