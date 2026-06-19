// Immutable Set toggle: returns a new Set with the value added or removed.
export const toggleInSet = <Value>(
  set: ReadonlySet<Value>,
  value: Value,
): ReadonlySet<Value> => {
  const next = new Set(set);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
};
