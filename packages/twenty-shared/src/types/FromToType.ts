export type FromTo<T, K extends string = ''> = {
  [P in ['from', 'to'][number] as `${P}${Capitalize<K>}`]: T;
};