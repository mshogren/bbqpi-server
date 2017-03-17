module.exports = function testPromise(promise, callback) {
  return promise
    .then(callback)
    .catch(console.log);
};
