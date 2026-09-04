export function partitionArray<T>(arr: T[], pred: (item: T) => boolean): [T[], T[]] {
  const pass: T[] = [], fail: T[] = [];
  for (const it of arr) (pred(it) ? pass : fail).push(it);
  return [pass, fail];
}