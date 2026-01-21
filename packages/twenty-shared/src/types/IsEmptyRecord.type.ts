export type IsEmptyRecord<T extends object> = keyof T extends never
  ? true
  : false;
