export type IsEmptyObject<T extends object> = [keyof T] extends [never]
  ? true
  : false;
