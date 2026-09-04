export function partitionByKey<T>(arr: T[], keyFn: (item: T) => string): Record<string, T[]> {
  const res: Record<string, T[]> = {};
  for (const it of arr) { const k = keyFn(it); (res[k] = res[k] || []).push(it); }
  return res;
}