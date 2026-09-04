export function removeDuplicateObjects<T>(arr: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return arr.filter(it => { const k = keyFn(it); if (seen.has(k)) return false; seen.add(k); return true; });
}