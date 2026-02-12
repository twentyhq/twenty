export function orderObjectProperties<T>(data: T): T {
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
