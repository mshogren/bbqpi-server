module.exports = (config) => {
  config.set({
    files: ['src/**/*.js', 'src/**/*.test.js'],
    mutate: ['src/**/*.js'],
    testRunner: 'jest',
    coverageAnalysis: 'off',
    logLevel: 'debug',
  });
};
