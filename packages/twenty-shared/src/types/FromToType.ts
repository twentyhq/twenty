export type FromTo<T, K extends string = ''> = {
  [P in 'from' | 'to' as `${P}${Capitalize<K>}`]: T;
};
