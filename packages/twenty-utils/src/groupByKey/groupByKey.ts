export function groupByKey<T, K extends keyof T>(items: T[], key: K): Record<string, T[]> {
  return items.reduce((acc, item) => {
    const val = String(item[key]); (acc[val] = acc[val] || []).push(item); return acc;
  }, {} as Record<string, T[]>);
}