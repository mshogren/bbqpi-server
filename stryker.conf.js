module.exports = (config) => {
  config.set({
    files: [
      'src/**/*.js',
      '!src/server*.js',
      '!src/backend/**.js',
    ],
    mutate: [
      'src/**/*.js',
      '!src/server*.js',
      '!src/backend/**.js',
      '!src/**/*.test.js',
    ],
    testRunner: 'jest',
    coverageAnalysis: 'off',
    maxConcurrentTestRunners: 2,
    timeoutMs: 10000,
    thresholds: { high: 80, low: 60, break: 80 },
    // logLevel: 'trace',
  });
};
