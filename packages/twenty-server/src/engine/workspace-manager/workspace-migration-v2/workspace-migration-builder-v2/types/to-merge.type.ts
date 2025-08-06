export type ToMerge<T, K extends string> = {
  [P in 'toMerge' | 'dest' as `${P}${Capitalize<K>}`]: T;
};
