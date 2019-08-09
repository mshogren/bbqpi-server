module.exports = (config) => {
  config.set({
    files: [
      'src/**/*.js',
      '!src/server*.js',
      '!src/app*.js',
      '!src/backend/**.js',
    ],
    mutate: [
      'src/**/*.js',
      '!src/server*.js',
      '!src/app*.js',
      '!src/backend/**.js',
      '!src/**/*.test.js',
    ],
    mutator: 'javascript',
    testRunner: 'jest',
    jest: {
      config: {
        testPathIgnorePatterns: [],
        testURL: 'http://localhost/'
      }
    },
    reporters: ['clear-text', 'progress', 'dashboard'],
    coverageAnalysis: 'off',
    maxConcurrentTestRunners: 2,
    timeoutMS: 10000,
    thresholds: { high: 80, low: 50, break: 50 },
    // logLevel: 'trace',
  });
};
