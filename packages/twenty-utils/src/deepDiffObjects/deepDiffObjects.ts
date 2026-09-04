export function deepDiffObjects(obj1: Record<string, any>, obj2: Record<string, any>): Record<string, { from: any; to: any }> {
  const diff: Record<string, { from: any; to: any }> = {};
  const keys = new Set([...Object.keys(obj1), ...Object.keys(obj2)]);
  for (const k of keys) {
    if (obj1[k] !== obj2[k]) diff[k] = { from: obj1[k], to: obj2[k] };
  }
  return diff;
}