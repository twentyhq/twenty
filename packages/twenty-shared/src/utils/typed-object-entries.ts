type StrictEntries<T> = T extends unknown
  ? { [K in keyof T]-?: [K, T[K]] }[keyof T]
  : never;

export const typedObjectEntries = <T extends Record<string, unknown>>(
  object: T,
): Array<StrictEntries<T>> => Object.entries(object) as Array<StrictEntries<T>>;
