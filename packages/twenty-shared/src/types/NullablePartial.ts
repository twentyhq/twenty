export type NullablePartial<T> = {
  [P in keyof T]: T[P] | null;
};
