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
        testPathIgnorePatterns: []
      }
    },
    reporter: ['clear-text', 'progress', 'dashboard'],
    coverageAnalysis: 'off',
    maxConcurrentTestRunners: 2,
    timeoutMs: 10000,
    thresholds: { high: 80, low: 60, break: 60 },
    // logLevel: 'trace',
  });
};
