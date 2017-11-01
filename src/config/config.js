const Store = require('jfs');

module.exports = new Store('/data/config.json', { type: 'single', pretty: true });
