const path = require('path');
const Store = require('jfs');

const basePath = process.env.RESIN ? '/data' : 'config';
const filePath = path.join(basePath, 'config.json');

module.exports = new Store(filePath, { type: 'single', pretty: true });
