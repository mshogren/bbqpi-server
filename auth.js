const inherits = require('util').inherits;
const EventEmitter = require('events').EventEmitter;
const request = require('request');
const fs = require('fs');
const refreshtokenFile = require('./refreshToken.json');

function FirebaseAuth(firebase, googleOAuthConfig) {
  if (!(this instanceof FirebaseAuth)) return new FirebaseAuth(firebase, googleOAuthConfig);

  EventEmitter.call(this);

  const self = this;

  self.requestInterval = null;

  const {
    deviceRequestUrl,
    client_id,
    client_secret,
    scope,
    tokenRequestUrl,
  } = googleOAuthConfig;

  const deviceRequestBody = {
    form: {
      client_id,
      scope,
    },
  };

  let handleDeviceResponse;

  const handleTokenResponse = function handleTokenResponse(err, response, body) {
    const token = JSON.parse(body);

    if (token.id_token) {
      clearInterval(self.requestInterval);
      const credential = firebase.auth.GoogleAuthProvider.credential(token.id_token);
      firebase.auth().signInWithCredential(credential).catch((loginErr) => {
        console.log(loginErr);
      });

      if (token.refresh_token) {
        refreshtokenFile.refresh_token = token.refresh_token;
        fs.writeFile('./refreshToken.json', JSON.stringify(refreshtokenFile), (fileErr) => {
          if (fileErr) console.log(fileErr);
        });
      }
    } else if (token.error) {
      console.log(token.error);
      if (token.error === 'invalid_grant') {
        request.post(deviceRequestUrl, deviceRequestBody, handleDeviceResponse);
      }
    }
  };

  handleDeviceResponse = function handleDeviceResponseFunc(err, response, body) {
    const { verification_url, expires_in, interval, device_code, user_code } = JSON.parse(body);

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

    clearInterval(self.tokenRequestInterval);
    self.tokenRequestInterval = setInterval(() => {
      request.post(tokenRequestUrl, tokenRequestBody, handleTokenResponse);
    }, (interval + 1) * 1000);

    clearInterval(self.deviceRequestInterval);
    /* eslint-disable camelcase */
    self.deviceRequestInterval = setInterval(() => {
      request.post(deviceRequestUrl, deviceRequestBody, handleDeviceResponse);
    }, (expires_in - 10) * 1000);
    /* eslint-enable camelcase */
  };

  const login = function login() {
    if (refreshtokenFile.refresh_token) {
      const refreshRequestBody = {
        form: {
          client_id,
          client_secret,
          refresh_token: refreshtokenFile.refresh_token,
          grant_type: 'refresh_token',
        },
      };

      request.post(tokenRequestUrl, refreshRequestBody, handleTokenResponse);
    } else {
      request.post(deviceRequestUrl, deviceRequestBody, handleDeviceResponse);
    }
  };

  firebase.auth().onAuthStateChanged((user) => {
    if (user) {
      console.log(`${user.email} logged in`);
      clearInterval(self.tokenRequestInterval);
      clearInterval(self.deviceRequestInterval);
      self.emit('login', user);
    } else {
      console.log('Logged out');
      self.emit('logout');
      login();
    }
  });
}

inherits(FirebaseAuth, EventEmitter);

FirebaseAuth.prototype.stop = function stop() {
  clearInterval(this.tokenRequestInterval);
  clearInterval(this.deviceRequestInterval);
};

module.exports = FirebaseAuth;
