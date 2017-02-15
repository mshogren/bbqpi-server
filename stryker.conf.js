module.exports = (config) => {
  config.set({
    files: [
      'src/config/**/*.js',
      'src/push/**/*.js',
      'src/**/temperature.js',
      'src/**/*.test.js',
    ],
    mutate: [
      'src/config/**/*.js',
      'src/push/**/*.js',
      'src/**/temperature.js',
      '!src/**/*.test.js',
    ],
    testRunner: 'jest',
    coverageAnalysis: 'off',
    // logLevel: 'debug',
  });
};
