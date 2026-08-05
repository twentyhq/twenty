export const deepSizeBytes = (root: unknown, nodeCap: number): number => {
  const seen = new WeakSet<object>();
  const stack: unknown[] = [root];
  let bytes = 0;
  let visited = 0;

  while (stack.length > 0 && visited < nodeCap) {
    visited += 1;

    const value = stack.pop();

    if (typeof value === 'string') {
      bytes += 12 + value.length * 2;
      continue;
    }
    if (typeof value === 'number') {
      bytes += 8;
      continue;
    }
    if (typeof value === 'boolean') {
      bytes += 4;
      continue;
    }
    if (
      value === null ||
      (typeof value !== 'object' && typeof value !== 'function')
    ) {
      continue;
    }
    if (seen.has(value)) {
      continue;
    }
    seen.add(value);

    if (Array.isArray(value)) {
      bytes += 16 + value.length * 8;
      for (const item of value) {
        stack.push(item);
      }
      continue;
    }

    if (value instanceof Map) {
      bytes += 48 + value.size * 16;
      for (const [mapKey, mapValue] of value) {
        stack.push(mapKey);
        stack.push(mapValue);
      }
      continue;
    }

    if (value instanceof Set) {
      bytes += 48 + value.size * 8;
      for (const item of value) {
        stack.push(item);
      }
      continue;
    }

    bytes += 32;
    let entries: [string, unknown][] = [];

    try {
      entries = Object.entries(value);
    } catch {
      entries = [];
    }
    for (const [entryKey, child] of entries) {
      bytes += entryKey.length * 2 + 8;
      stack.push(child);
    }
  }

  return bytes;
};
