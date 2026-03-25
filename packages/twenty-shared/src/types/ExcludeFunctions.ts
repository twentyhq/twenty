export type ExcludeFunctions<T> = T extends Function ? never : T;
