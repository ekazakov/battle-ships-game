const counters = new Map();

module.exports = function getNextId(prefix) {
  if (counters.has(prefix)) {
    const value = counters.get(prefix) + 1;
    counters.set(prefix, value);
    return value;
  }

  counters.set(prefix, 1);
  return 1;
};
