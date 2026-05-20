// Finds the index of T in a readonly string tuple.
export type IndexOf<
  T extends string,
  Arr extends readonly string[],
  Acc extends unknown[] = [],
> = Arr extends readonly [infer Head, ...infer Tail extends readonly string[]]
  ? Head extends T
    ? Acc['length']
    : IndexOf<T, Tail, [...Acc, unknown]>
  : never;
