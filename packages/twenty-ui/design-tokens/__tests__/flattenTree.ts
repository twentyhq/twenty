export const flattenTree = (
  node: unknown,
  path: string[] = [],
): Map<string, unknown> => {
  const flattened = new Map<string, unknown>();
  if (typeof node !== 'object' || node === null) {
    flattened.set(path.join('.'), node);
    return flattened;
  }
  for (const [key, value] of Object.entries(node)) {
    for (const [nestedPath, nestedValue] of flattenTree(value, [
      ...path,
      key,
    ])) {
      flattened.set(nestedPath, nestedValue);
    }
  }
  return flattened;
};
