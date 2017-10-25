const Store = require('jfs');

module.exports = new Store('config/config.json', { type: 'single', pretty: true });
