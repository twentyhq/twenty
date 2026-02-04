export type PropertyUpdate<T, P extends keyof T> = {
  property: P;
  to: T[P];
};
