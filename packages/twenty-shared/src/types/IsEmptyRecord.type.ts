export type IsEmptyRecord<T extends {}> = keyof T extends never ? true : false;
