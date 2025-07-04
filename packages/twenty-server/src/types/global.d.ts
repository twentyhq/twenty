type CircularDep<T> = T;

type ExcludeFunctions<T> = T extends (...args: unknown[]) => unknown
  ? never
  : T;
