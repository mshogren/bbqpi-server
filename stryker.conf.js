module.exports = (config) => {
  config.set({
    files: ['temperature.js', 'temperature.test.js'],
    mutate: ['temperature.js'],
    testRunner: 'jest',
    coverageAnalysis: 'off',
    logLevel : 'debug',
  });
};
