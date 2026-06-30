export type NonNullableRequired<T> = {
  [P in keyof T]-?: NonNullable<T[P]>;
};
