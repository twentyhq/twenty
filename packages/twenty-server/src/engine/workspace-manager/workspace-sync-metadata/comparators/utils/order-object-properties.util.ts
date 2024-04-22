export function orderObjectProperties<T extends object>(data: T[]): T[];

export function orderObjectProperties<T extends object>(data: T): T;

export function orderObjectProperties<T extends Array<any> | object>(
  data: T,
): T {
  if (Array.isArray(data)) {
    return data.map(orderObjectProperties) as T;
  }

  if (data !== null && typeof data === 'object') {
    return Object.fromEntries(
      Object.entries(data)
        .sort()
        .map(([key, value]) => [key, orderObjectProperties(value)]),
    ) as T;
  }

  return data;
}
