// A string enum is not assignable from its own plain string values, unlike a
// literal union; the Record check rules out `string`, patterns and brands
export type IsStringEnum<T> = [T] extends [string]
  ? Record<never, never> extends Record<`${T}`, true>
    ? false
    : [`${T}`] extends [T]
      ? false
      : true
  : false;
