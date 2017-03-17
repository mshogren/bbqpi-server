const assert = require('assert');
const sinon = require('sinon');
const testPromise = require('../src/promisetest/promisetest');

it('does not call the callback on failure', () => {
  const promise = new Promise((resolve, reject) => {
    reject('mock error');
  });

  const callback = sinon.spy();

  return testPromise(promise, callback)
    .then(() => {})
    .catch(() => {
      assert(!callback.called);
    });
});
