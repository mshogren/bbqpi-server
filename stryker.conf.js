module.exports = (config) => {
  config.set({
    files: [
      'src/**/*.js',
      '!src/server*.js',
      '!src/backend/**.js',
      '!src/promisetest/**/*.js',
      '!test/**/*.js',
    ],
    mutate: [
      'src/**/*.js',
      '!src/server*.js',
      '!src/backend/**.js',
      '!src/promisetest/**/*.js',
      '!src/**/*.test.js',
    ],
    testRunner: 'jest',
    coverageAnalysis: 'off',
    // logLevel: 'trace',
  });
};
