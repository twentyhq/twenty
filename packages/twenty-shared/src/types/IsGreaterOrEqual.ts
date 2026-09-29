// Returns true if A >= B using tuple-length counting.
export type IsGreaterOrEqual<
  A extends number,
  B extends number,
  Acc extends unknown[] = [],
> = Acc['length'] extends A
  ? Acc['length'] extends B
    ? true
    : false
  : Acc['length'] extends B
    ? true
    : IsGreaterOrEqual<A, B, [...Acc, unknown]>;
