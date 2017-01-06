const bbq = require('./bbq')();
const firebase = require('firebase');
const googleConfig = require('./backendConfig.js');
const request = require('request');

firebase.initializeApp(googleConfig.firebase);

const db = firebase.database();
const stateRef = db.ref('state');
const tempRef = db.ref('targetTemperature');

const period = 1000 * 60 * 60 * 1;

const truncateData = function truncateData() {
  const toDeleteRef = stateRef.orderByChild('timestamp').endAt((Date.now() - period));
  toDeleteRef.once('value', (toDelete) => {
    toDelete.forEach((child) => {
      child.ref.remove().then(
        () => {},
        (err) => {
          console.log(err);
        });
    });
  });
};

let purgeInterval;
let requestInterval;

const gracefulShutdown = function gracefulShutdown() {
  clearInterval(purgeInterval);
  bbq.stop();
  db.goOffline();
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

const {
  deviceRequestUrl,
  client_id,
  client_secret,
  scope,
  tokenRequestUrl,
} = googleConfig.googleAuth;

const deviceRequestBody = {
  form: {
    client_id,
    scope,
  },
};

const handleTokenResponse = function handleTokenResponse(err, response, body) {
  console.log(body);
  const token = JSON.parse(body);

  if (token.id_token) {
    clearInterval(requestInterval);
    const credential = firebase.auth.GoogleAuthProvider.credential(token.id_token);
    firebase.auth().signInWithCredential(credential);
  }
};

const handleDeviceResponse = function handleDeviceResponse(err, response, body) {
  const { verification_url, interval, device_code, user_code } = JSON.parse(body);

  /* eslint-disable camelcase */
  console.log(`Verification Url: ${verification_url}, Code: ${user_code}`);
  /* eslint-enable camelcase */

  const tokenRequestBody = {
    form: {
      client_id,
      client_secret,
      code: device_code,
      grant_type: 'http://oauth.net/grant_type/device/1.0',
    },
  };

  requestInterval = setInterval(() => {
    request.post(tokenRequestUrl, tokenRequestBody, handleTokenResponse);
  }, (interval + 1) * 1000);
};

firebase.auth().onAuthStateChanged((user) => {
  if (user) {
    console.log(`${user.email} logged in`);

    truncateData();
    purgeInterval = setInterval(truncateData, period);

    bbq.on('temperatureChange', (data) => {
      const record = data;
      record.timestamp = firebase.database.ServerValue.TIMESTAMP;
      stateRef.push(data).then(
        () => {},
        (err) => {
          console.log(err);
        });
    });

    tempRef.on('value', (data) => {
      const temp = data.val();
      bbq.setTarget(temp);
      console.log('Target: ', temp);
    });
  } else {
    request.post(deviceRequestUrl, deviceRequestBody, handleDeviceResponse);
  }
});

