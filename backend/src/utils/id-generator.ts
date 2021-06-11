const counters = new Map();

export function getNextId(prefix) {
  if (counters.has(prefix)) {
    const value = counters.get(prefix) + 1;
    counters.set(prefix, value);
    return `${prefix}_${value}`;
  }

  counters.set(prefix, 1);
  return `${prefix}_${1}`;
}

export function resetIds() {
  counters.clear();
}
