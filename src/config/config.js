const path = require('path');
const Store = require('jfs');
const resin = require('./resin');

const basePath = resin ? '/data' : 'config';
const filePath = path.join(basePath, 'config.json');

module.exports = {
  store: new Store(filePath, { type: 'single', pretty: true }),
  resin,
};
