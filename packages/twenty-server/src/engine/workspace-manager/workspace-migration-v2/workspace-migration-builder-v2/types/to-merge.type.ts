export type ToMerge<T, K extends string> = {
  [P in ['toMerge', 'dest'][number] as `${P}${Capitalize<K>}`]: T;
};
