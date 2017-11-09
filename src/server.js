const App = require('./app');
const lockfile = require('lockfile');

let app;

if (process.env.RESIN) {
  lockfile.lock('/tmp/resin/resin-updates.lock', (err) => {
    if (err) console.log(err);
    app = App();
  });
} else {
  app = App();
}

const gracefulShutdown = function gracefulShutdown() {
  lockfile.unlock('/tmp/resin/resin-updates.lock', (err) => {
    throw err;
  });
  if (app) app.stop();
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

