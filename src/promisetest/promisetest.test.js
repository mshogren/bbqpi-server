const testPromise = require('./promisetest');

test('does not call the callback on failure', () => {
  const promise = new Promise((resolve, reject) => {
    reject('mock error');
  });

  const callback = jest.fn();

  return testPromise(promise, callback)
    .then(() => {})
    .catch(() => {
      expect(callback).not.toHaveBeenCalled();
    });
});
