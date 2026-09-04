export function deepMergeArraysByKey<T extends Record<string, any>>(arr1: T[], arr2: T[], key: keyof T): T[] {
  const map = new Map<any, T>();
  arr1.forEach(it => map.set(it[key], { ...it }));
  arr2.forEach(it => map.set(it[key], { ...map.get(it[key]), ...it }));
  return Array.from(map.values());
}