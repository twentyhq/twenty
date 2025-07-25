export type ToMerge<T, K extends 'object' | 'field'> = {
  [P in ['toMerge', 'dest'][number] as `${P}Flat${Capitalize<K>}Metadatas`]: T;
};
