export type Arrayable<T> = {
  [P in keyof T]: Array<T[P]>;
};
