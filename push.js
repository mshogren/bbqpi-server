const webpush = require('web-push');
const fs = require('fs');
const pushConfigFile = require('./pushConfig.json');

function WebPush() {
  if (!(this instanceof WebPush)) return new WebPush();

  const { publicKey, privateKey } = pushConfigFile.publicKey
    ? pushConfigFile
    : webpush.generateVAPIDKeys();

  if (!pushConfigFile.publicKey) {
    pushConfigFile.publicKey = publicKey;
    pushConfigFile.privateKey = privateKey;

    fs.writeFile('./pushConfig.json', JSON.stringify(pushConfigFile), (fileErr) => {
      if (fileErr) console.log(fileErr);
    });
  }

  this.publicKey = publicKey;

  const url = 'https://dev.michael-shogren.com';
  webpush.setVapidDetails(url, publicKey, privateKey);
}

WebPush.prototype.sendNotification = function sendNotification(subscription, payload, callback) {
  webpush.sendNotification(subscription, payload)
    .then(() => {
      if (callback) callback();
    })
    .catch(console.log);
};

module.exports = WebPush;
