const path = require('path');
const Store = require('jfs');
const Resin = require('./resin');

module.exports = () => {
  const resin = Resin();
  const basePath = resin ? '/data' : 'config';
  const filePath = path.join(basePath, 'config.json');

  let store;

  try {
    store = new Store(filePath, { type: 'single', pretty: true });
  } catch (err) {
    throw new Error('config store error');
  }

  return { store, resin };
};
