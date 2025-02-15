export type IsExactly<T, U> = [T] extends [U]
  ? [U] extends [T]
    ? true
    : false
  : false;
